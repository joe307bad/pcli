import { Command, flags } from '@oclif/command'
import { fromNullable, isSome, map, isNone } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as e from 'fp-ts/lib/Either';
import { findFirst } from 'fp-ts/lib/Array';

import env from '../../shared/env';
import { Logger as log } from '../../shared/logger';
import { Analyzer as analyzer } from '../../services';


const ANALYZER_ERRORS = {
    NO_ACHIEVMENTS_JSON_FILE_SPECIFIED: "There was no Achievements JSON specified in the .env file or using the --file flag"
}

const ANALYZER_MESSAGES = {
    WELL_FORMED_ACHIEVMENTS_JSON_FILE: `Achievements JSON is well-formed`
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
            map(s => s.value)
        )

        if (isNone(file))
            return log.error(ANALYZER_ERRORS.NO_ACHIEVMENTS_JSON_FILE_SPECIFIED)

        pipe(
            analyzer.validateList(file.value),
            e.fold(
                err => e.of(log.error(err.message)),
                m => e.of(log.success(ANALYZER_MESSAGES.WELL_FORMED_ACHIEVMENTS_JSON_FILE))
            )
        )
    }
}