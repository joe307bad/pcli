import * as a from 'fp-ts/lib/Array'
import * as o from 'fp-ts/lib/Option'
import * as e from 'fp-ts/lib/Either'
import { readSync, CASELESS_SORT } from 'readdir';
import { pipe } from 'fp-ts/lib/pipeable';
import { Mutation, MutationType } from '../../core/definitions/mutation.definition';
import { Analyzer as analyze } from '../../services/achievements/analyzer.service';
import { TAchievement } from '../../core/definitions/achievement.definition';
import * as fs from 'fs';

const VERSION_ERRORS = {
    ERROR_GETTING_NEW_VERSION_NUMBER: (err: any, path: string) => `There was an error getting a new versio number for ${path}. Error: \n${err.toString()}`,
    ERROR_COMMITTING_MUTATIONS_TO_NEW_VERSION: (err: any) => `There was an error committing the mutations from a changeset to a new version. Error: \n${err.toString()}`
}

export class Version {
    static newVersionNumber = (versionDirPath: string) =>
        e.tryCatch(() => pipe(
            readSync(versionDirPath, ['*.json'], [CASELESS_SORT]),
            a.reverse,
            a.findFirst(_ => true),
            v => o.getOrElse(() => '1.json')(v),
            v => Number(v.split('.').slice(0, -1).join('.')),
            v => v === NaN ? 1 : v + 1
        ), err => e.toError(
            VERSION_ERRORS.ERROR_GETTING_NEW_VERSION_NUMBER(err, versionDirPath)
        ))

    static create = (mutations: Mutation[], newVersionNumber: number, versionDirPath: string) => {
        const newVersionFilePath = `${versionDirPath}${(newVersionNumber)}.json`;
        return pipe(
            analyze.validateList(`${versionDirPath}${(newVersionNumber - 1)}.json`),
            e.chain(a => Version._commitMutations(a, mutations)),
            e.chain(a => e.tryCatch(() => {
                fs.writeFileSync(newVersionFilePath, JSON.stringify(a), 'utf8')
                return newVersionFilePath;
            }, err => e.toError(
                VERSION_ERRORS.ERROR_GETTING_NEW_VERSION_NUMBER(err, versionDirPath)
            )))
        )
    }

    private static _commitMutations = (achievements: TAchievement[], mutations: Mutation[]) => e.tryCatch(() =>
        mutations.reduce((acc, m) => {
            const ai = acc.findIndex(a => a.name === m.name);
            if (ai > -1) {
                switch (m.column) {
                    case MutationType.newCategory:
                        acc[ai] = {
                            ...acc[ai],
                            category: m.newValue?.toString() ?? ''
                        }
                        break;
                    case MutationType.newName:
                        acc[ai] = {
                            ...acc[ai],
                            name: m.newValue?.toString() ?? ''
                        }
                        break;
                    case MutationType.newPoints:
                        acc[ai] = {
                            ...acc[ai],
                            points: Number(m.newValue) ?? 0
                        }
                        break;
                }
            }
            return acc
        }, achievements), err => e.toError(
            VERSION_ERRORS.ERROR_COMMITTING_MUTATIONS_TO_NEW_VERSION(err)
        ))
}