import { promises as fs } from 'fs';
import { tryCatch, chain } from 'fp-ts/lib/TaskEither'
import { toError } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { Parser as parse } from '../parser.service';
import { AchievementDto } from 'points/Shared.Points'

const ANALYYZER_ERRORS = {
    ERROR_GETTING_FILE: (filePath: string, e: any) => `Error reading Achievement JSON file. File path: \n${filePath}\n\n${e.toString()} `
}

export class Analyzer {
    static validateList = async (achievementsJsonFile: string) => pipe(
        tryCatch(() => fs.readFile(achievementsJsonFile), e => toError(
            ANALYYZER_ERRORS.ERROR_GETTING_FILE(achievementsJsonFile, e)
        )),
        chain((a) =>
            tryCatch(() => Promise.reject(), e => toError("Another error"))
        )
    )()

    exportListToCsv() {

    }

    generateChangesetCsv() {

    }

    generateVersionJson() {

    }


}