import * as R from 'remeda';
import * as path from 'path';
import * as fs from 'fs';
import { pipe } from 'fp-ts/lib/pipeable';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import * as a from 'fp-ts/lib/Array';
import { array, ValidationError } from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter'
import { createObjectCsvWriter } from 'csv-writer';
import { filter } from 'fp-ts/lib/Array';
import { isNone } from 'fp-ts/lib/Option';

import { Parser as parse } from '../../services/parser.service';
import { RHunk, THunk, NewProperties, TNewProperties } from '../../core/definitions';
import isEmpty from '../../shared/utils/isEmpty';
import { getMostRecentFile } from '../../shared/utils/getMostRecentFile';
import { Mutation, MutationType } from '../../core/definitions/mutation.definition';

declare const BetterObject: {
    keys<T extends {}>(object: T): (keyof T)[]
}

const CHANGESET_ERRORS = {
    ERROR_GETTING_CHANGESETS_DIR: (path: string, e: any) => `Error accessing Changeset directoory: Directory path:\n${path}\n${e.toString()}`,
    NO_CHANGSETS_FOUND_IN_CHANGESETS_DIR: (path: string) => `There were no Changesets found in the Changeset directory path. Directory path:\n${path}`,
    ERROR_GETTING_CHANGESET_FILE: (filePath: string, e: any) => `Error reading Changeset file. File path: \n${filePath}\n\n${e.toString()} `,
    ERROR_MAPPING_RAW_JSON_TO_CHANGESET_WITHOUT_IOTS: (e: any) => `There was an Error mapping the provided and parsed CSV to JSON. This is not an io-ts validation error. Something in the raw CSV does not map to the shape of a Changeset. Error: \n${e.toString()}`,
    ERROR_DECODING_CHANGESET_JSON: (errors: ValidationError[]) => [
        `There was a mismatched type while decoding the Changeset`,
        ...failure(errors),
    ].join('\n\n'),
    ERROR_WRITING_NEW_CHANGESET: (err: any) => `There was an error writing the new changeset: Error \n${err.toString()}`,
    ERROR_CONVERTING_CHANGESET_INTO_MUTATIONS: (err: any) => `There ws an Error converting the changeset into a list of mutations: Error \n${err.toString()}`
}

enum EAction {
    NEW_NAME = 'newName',
    NEW_CATEGORY = 'newCategory',
    NEW_POINTS = 'newPoints',
    IS_DUPLICATE = 'isDuplicate'
}

export class Changeset {

    static getMostRecent = (changesetsDirPath: string) => {
        const changesets = fs.readdirSync(changesetsDirPath);

        const fullPathToChangeset = (p: string) => path.join(changesetsDirPath, p);

        const mostRecentChangeset = () =>
            getMostRecentFile(changesets, changesetsDirPath, '.csv')

        const noChangesetsFoundError =
            e.toError(CHANGESET_ERRORS.NO_CHANGSETS_FOUND_IN_CHANGESETS_DIR(changesetsDirPath))

        return pipe(
            e.tryCatch(() => { }, err => e.toError(
                CHANGESET_ERRORS.ERROR_GETTING_CHANGESETS_DIR(changesetsDirPath, err)
            )),
            e.chain(() =>
                e.fromNullable(noChangesetsFoundError)(mostRecentChangeset())
            ),
            e.fold(e.left, (s) => e.right(fullPathToChangeset(s))));
    }

    static validate = (changesetPath: string) => {

        const changesetParsed = (mappedChangeset: any[]) => pipe(
            array(RHunk).decode(mappedChangeset),
            e.fold(
                errs => e.left(e.toError(CHANGESET_ERRORS.ERROR_DECODING_CHANGESET_JSON(errs))),
                changeset => e.right(changeset)
            )
        );

        return pipe(
            e.tryCatch(() => fs.readFileSync(changesetPath), err => e.toError(
                CHANGESET_ERRORS.ERROR_GETTING_CHANGESET_FILE(changesetPath, err)
            )),
            e.chain((b) => parse.csvSync<any[]>(b)),
            e.chain(Changeset.mapJsonToChangeset),
            e.chain(changesetParsed)
        );
    }

    static getChangedHunks = (changeset: THunk[]) => {

        const isUnchangedHunks = (h: THunk) => R.pipe(
            h,
            R.pick(Object.values(EAction)),
            R.toPairs,
            R.map(x => x[1])
        ).every(x => isNone(isEmpty(x)));

        const b = e.tryCatch(() => pipe(
            changeset,
            filter(x => !isUnchangedHunks(x))
        ), e.toError)

        return b;
    };

    static writeToCsv = (versionsDirPath: string, changesetsDirPath: string, changeset: THunk[]) => {
        const versions = fs.readdirSync(versionsDirPath);

        const mostRecentChangeset = () =>
            getMostRecentFile(versions, versionsDirPath, '.json')

        const currentVersionNumber = Number(pipe(
            o.fromNullable(mostRecentChangeset()),
            o.map(x => x.split('.').slice(0, -1).join('.')),
            o.getOrElse(() => '1')
        ))

        const newVersionNumber = currentVersionNumber + 1;

        const changesetFileName = `changeset_${currentVersionNumber}-${newVersionNumber}_${new Date().toISOString()}.csv`

        const writer = createObjectCsvWriter({
            path: path.join(changesetsDirPath, changesetFileName),
            header: R.pipe(
                RHunk.types,
                R.reduce((acc, x) => ({ ...acc, ...x.props }), {}),
                R.toPairs,
                R.map(x => ({ id: x[0], title: x[0] }))
            )
        });

        return pipe(
            e.tryCatch(async () => await writer.writeRecords(changeset), err =>
                e.toError(CHANGESET_ERRORS.ERROR_WRITING_NEW_CHANGESET(err))
            ),
            e.fold(err => e.left(err), () => e.right(changesetFileName))
        );

    }

    static toCommandList = (changeset: THunk[]) => {

        const mutations = () => changeset.flatMap(cs =>
            Object.keys(NewProperties).reduce((acc: Mutation[], np) => {
                const newValue = (cs as any)[np];
                const mutatedColumn = (MutationType as any)[np];
                if (newValue?.toLowerCase().includes('duplicate')) {
                    acc.push({
                        newValue: undefined,
                        name: cs.name,
                        column: MutationType.IS_DUPLICATE
                    })
                } else if (newValue?.trim() !== '') {
                    acc.push({
                        newValue: mutatedColumn === MutationType.newPoints
                            ? Number(newValue)
                            : newValue,
                        name: cs.name,
                        column: mutatedColumn
                    })
                }
                return acc;
            }, []))

        return pipe(
            e.tryCatch(() => mutations(), err =>
                e.toError(CHANGESET_ERRORS.ERROR_CONVERTING_CHANGESET_INTO_MUTATIONS(err))
            ),
            e.fold(err => e.left(err), (mutations) => e.right(mutations))
        );;
    }

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
                    newName,
                    isDuplicate
                ] = hunk;
                return {
                    name,
                    description,
                    points: Number(points),
                    photo,
                    category,
                    newPoints,
                    newCategory,
                    newName,
                    isDuplicate
                };
            })
        )

        return pipe(
            e.tryCatch(() => anyToChangeset(), err => e.toError(
                CHANGESET_ERRORS.ERROR_MAPPING_RAW_JSON_TO_CHANGESET_WITHOUT_IOTS(err)
            ))
        )
    }

}