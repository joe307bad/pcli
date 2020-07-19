import { Command, flags } from '@oclif/command'
import { fromNullable, fold, chain, getOrElse, isSome, map } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { left, right, isLeft, isRight } from 'fp-ts/lib/Either';
import * as te from 'fp-ts/lib/TaskEither';
import { findFirst } from 'fp-ts/lib/Array';

import env from '../../shared/env';
import { Logger as log } from '../../shared/logger';
import isEmpty from '../../shared/utils/isEmpty';
import { Analyzer as analyzer } from '../../services';


const ANALYZER_ERRORS = {
    NO_ACHIEVMENTS_JSON_FILE_SPECIFIED: "There was no Achievements JSON specified in the .env file or using the --file flag"
}

const ANALYZER_MESSEGES = {

}

export default class Analyzer extends Command {
    static description = 'Set of tools to analyze Achievements'

    static examples = [
        `$ pcli achievements:analyzer`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        file: flags.string({ char: 'f', description: 'Achievements JSON file' })
    }

    async run() {
        const { flags } = this.parse(Analyzer)

        const achievementsJsonFile = [
            fromNullable(flags.file),
            env.ACHIEVEMENTS_JSON_FILE
        ];

        const file = pipe(
            achievementsJsonFile,
            findFirst(isSome),
            map(s => s.value),
            getOrElse(() => '')
        )

        pipe(
            analyzer.validateList(file),
            te.fold(e => te.of(log.error(e.message)), m => te.of(log.success(m)))
        )()
    }
}