import { promises as fs } from 'fs';
import { tryCatch, chain, fromEither, fold, right, left } from 'fp-ts/lib/TaskEither'
import * as e from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { array } from 'io-ts';

import { Parser as parse } from '../parser.service';
import { TAchievement, RAchievement } from '../../core/definitions';

const ANALYZER_ERRORS = {
    ERROR_GETTING_FILE: (filePath: string, e: any) => `Error reading Achievement JSON file. File path: \n${filePath}\n\n${e.toString()} `
}

const ANALYZER_MESSAGES = {
    WELL_FORMED_ACHIEVMENTS_JSON_FILE: `Achievments JSON is well-formed`
}

export class Analyzer {
    static validateList = (achievementsJsonFile: string) => {
        const achievementsParsed = (s: Buffer) => parse.JSONSync<TAchievement[]>(
            s.toString(), achievementsJsonFile, array(RAchievement).decode
        )
        return pipe(
            tryCatch(() => fs.readFile(achievementsJsonFile), err => e.toError(
                ANALYZER_ERRORS.ERROR_GETTING_FILE(achievementsJsonFile, err)
            )),
            chain(s => fromEither(achievementsParsed(s))),
            fold(
                e => left(e),
                () => right(ANALYZER_MESSAGES.WELL_FORMED_ACHIEVMENTS_JSON_FILE)
            )
        )
    }
}