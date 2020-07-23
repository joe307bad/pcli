import * as R from 'remeda';
import * as path from 'path';
import * as fs from 'fs';
import { pipe } from 'fp-ts/lib/pipeable';
import { tryCatch, toError, fromNullable, chain, fold, left, right } from 'fp-ts/lib/Either';

import { Parser as parse } from '../../services/parser.service';

const CHANGESET_ERRORS = {
    ERROR_GETTING_CHANGESETS_DIR: (path: string, e: any) => `Error accessing Changeset directoory: Directory path:\n${path}\n${e.toString()}`,
    NO_CHANGSETS_FOUND_IN_CHANGESETS_DIR: (path: string) => `There were no Changesets found in the Changeset directory path. Directory path:\n${path}`,
    ERROR_GETTING_CHANGESET_FILE: (filePath: string, e: any) => `Error reading Changeset file. File path: \n${filePath}\n\n${e.toString()} `
}

const CHANGESET_MESSAGE = {
    CHANGESET_WELL_FORMED: `The Changeset is well-formed`
}

type TChangeset = {
    changes: any[]
};

export class Changeset {
    static getMostRecent = (changesetsDirPath: string) => {
        const changesets = fs.readdirSync(changesetsDirPath);

        const fullPathToChangeset = (p: string) => path.join(changesetsDirPath, p);

        const mostRecentChangeset = (cs: string[]) => R.pipe(
            cs,
            R.sort((a: string, b: string) => {
                var fullpath = fullPathToChangeset(a);
                var otherFullPath = fullPathToChangeset(b);
                const creationTime = fs.statSync(fullpath).ctime;
                const otherCreationTime = fs.statSync(otherFullPath).ctime
                return otherCreationTime.getTime() - creationTime.getTime();
            }),
            R.first()
        )

        const noChangesetsFoundError =
            toError(CHANGESET_ERRORS.NO_CHANGSETS_FOUND_IN_CHANGESETS_DIR(changesetsDirPath))

        return pipe(
            tryCatch(() => fs.readdirSync(changesetsDirPath), err => toError(
                CHANGESET_ERRORS.ERROR_GETTING_CHANGESETS_DIR(changesetsDirPath, err)
            )),
            chain(() => fromNullable(noChangesetsFoundError)(mostRecentChangeset(changesets))),
            fold(left, (s) => right(fullPathToChangeset(s))));
    }

    static validate = (changesetPath: string) => {

        // TODO map parsed changset (CSV) to json and validate that
        // against a set of io-ts custom types. If the validation passes, 
        // write the changeset to a json file in the changeset folder (which
        // should be a new method writeToJson

        const changesetParsed = (b: Buffer) => pipe(
            parse.csvSync<any[]>(b),
            fold(left, changeset => right(R.pipe(
                changeset,
                R.map(hunk => ({
                    b: 1
                }))
            )))
        )

        const c = pipe(
            tryCatch(() => fs.readFileSync(changesetPath), err => toError(
                CHANGESET_ERRORS.ERROR_GETTING_CHANGESET_FILE(changesetPath, err)
            )),
            chain(b => parse.csvSync<TChangeset[]>(b)),
            //fold(e => left(e), (b) => right(b))
        )
        return c;
    }

}