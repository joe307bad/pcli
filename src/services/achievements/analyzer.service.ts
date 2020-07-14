import { promises as fs } from 'fs';
import { tryCatch, chain, map } from 'fp-ts/lib/TaskEither'
import { toError } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { array } from 'io-ts';

import { Parser as parse } from '../parser.service';
import { TAchievement, RAchievement } from '../../core/definitions';

const ANALYZER_ERRORS = {
    ERROR_GETTING_FILE: (filePath: string, e: any) => `Error reading Achievement JSON file. File path: \n${filePath}\n\n${e.toString()} `
}

const ANALYZER_MESSAGES = {
    WELL_FORMED_ACHIEVEMENTS_JSON: `Achievments JSON is well-formed`
}

export class Analyzer {
    static validateList = async (achievementsJsonFile: string) => {
        const achievementsParsed = async (s: Buffer) => parse.JSON<TAchievement[]>(
            await fs.readFile(s, 'utf8'), achievementsJsonFile, array(RAchievement).decode
        )

        return pipe(
            tryCatch(() => fs.readFile(achievementsJsonFile), e => toError(
                ANALYZER_ERRORS.ERROR_GETTING_FILE(achievementsJsonFile, e)
            )),
            chain(s => tryCatch(() => achievementsParsed(s), toError)),
            map(() => ANALYZER_MESSAGES.WELL_FORMED_ACHIEVEMENTS_JSON)
        )()

    }
    exportListToCsv() {
    }

    generateChangesetCsv() {

    }

    generateVersionJson() {

    }


}