import * as R from 'remeda';
import * as path from 'path';
import * as fs from 'fs';
import { pipe } from 'fp-ts/lib/pipeable';
import { tryCatch, toError, fromNullable, chain, fold, left, right, isLeft } from 'fp-ts/lib/Either';
import { array, ValidationError, undefined } from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter'

import { Parser as parse } from '../../services/parser.service';
import { RHunk, THunk } from '../../core/definitions';
import { filter } from 'fp-ts/lib/Array';

const CHANGESET_ERRORS = {
    ERROR_GETTING_CHANGESETS_DIR: (path: string, e: any) => `Error accessing Changeset directoory: Directory path:\n${path}\n${e.toString()}`,
    NO_CHANGSETS_FOUND_IN_CHANGESETS_DIR: (path: string) => `There were no Changesets found in the Changeset directory path. Directory path:\n${path}`,
    ERROR_GETTING_CHANGESET_FILE: (filePath: string, e: any) => `Error reading Changeset file. File path: \n${filePath}\n\n${e.toString()} `,
    ERROR_MAPPING_RAW_JSON_TO_CHANGESET_WITHOUT_IOTS: (e: any) => `There was an Error mapping the provided and parsed CSV to JSON. This is not an io-ts validation error. Something in the raw CSV does not map to the shape of a Changeset. Error: \n${e.toString()}`,
    ERROR_DECODING_CHANGESET_JSON: (errors: ValidationError[]) => [
        `There was a mismatched type while decoding the Changeset`,
        ...failure(errors),
    ].join('\n')
}

enum EAction {
    NEW_NAME = 'newName',
    NEW_CATEGORY = 'newCategory',
    NEW_POINTS = 'newPoints'
}

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

        const changesetParsed = (mappedChangeset: any[]) => pipe(
            array(RHunk).decode(mappedChangeset),
            fold(
                errs => left(toError(CHANGESET_ERRORS.ERROR_DECODING_CHANGESET_JSON(errs))),
                changeset => right(changeset)
            )
        );

        return pipe(
            tryCatch(() => fs.readFileSync(changesetPath), err => toError(
                CHANGESET_ERRORS.ERROR_GETTING_CHANGESET_FILE(changesetPath, err)
            )),
            chain(b => parse.csvSync<any[]>(b)),
            chain(Changeset.mapJsonToChangeset),
            chain(changesetParsed)
        );
    }

    static getChangedHunks = (changeset: THunk[]) => {

        const isUnchangedHunks = (h: THunk) => R.pipe(
            h,
            R.pick(Object.values(EAction)),
            R.toPairs,
            R.map(x => x[1])
        ).every(x => isLeft(undefined.decode(x)));

        return tryCatch(() => pipe(
            changeset,
            filter(isUnchangedHunks)
        ), toError)
    };

    private static mapJsonToChangeset = (changeset: any[]) => {
        const anyToChangeset = () => R.pipe(
            changeset,
            R.filter.indexed<any, any[]>((_, i) => i > 0),
            R.map(hunk => {
                const [
                    name,
                    description,
                    points,
                    photo,
                    category,
                    newPoints,
                    newCategory,
                    newName
                ] = hunk;
                return {
                    name,
                    description,
                    points,
                    photo,
                    category,
                    newPoints,
                    newCategory,
                    newName
                };
            })
        )

        return pipe(
            tryCatch(() => anyToChangeset(), err => toError(
                CHANGESET_ERRORS.ERROR_MAPPING_RAW_JSON_TO_CHANGESET_WITHOUT_IOTS(err)
            ))
        )
    }

}