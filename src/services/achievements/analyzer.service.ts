import * as fs from 'fs';
import * as e from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { array } from 'io-ts';

import { Parser as parse } from '../parser.service';
import { TAchievement, RAchievement } from '../../core/definitions';

const ANALYZER_ERRORS = {
    ERROR_GETTING_FILE: (filePath: string, e: any) => `Error reading Achievement JSON file. File path: \n${filePath}\n\n${e.toString()} `
}

export class Analyzer {
    static validateList = (achievementsJsonFile: string) => {
        const achievementsParsed = (s: Buffer) => parse.JSONSync<TAchievement[]>(
            s.toString(), achievementsJsonFile, array(RAchievement).decode
        )

        return pipe(
            e.tryCatch(() => fs.readFileSync(achievementsJsonFile), err => e.toError(
                ANALYZER_ERRORS.ERROR_GETTING_FILE(achievementsJsonFile, err)
            )),
            e.chain(s => achievementsParsed(s)),
            e.fold(
                err => e.left(err),
                s => e.right(s)
            )
        )
    }
}