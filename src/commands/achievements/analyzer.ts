import { Command, flags } from '@oclif/command'
import { fromNullable, fold, chain } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { left, right, Either, isLeft } from 'fp-ts/lib/Either';
import * as te from 'fp-ts/lib/TaskEither';

import env from '../../shared/env';
import { Logger as log } from '../../shared/logger';
import isEmpty from '../../shared/utils/isEmpty';
import { Analyzer as analyzer } from '../../services';


const ANALYZER_ERRORS = {
    NO_ACHIEVEMENTS_JSON_SPECIFIED: "There was no Achievements JSON specified in the .env file or using the --file flag"
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

        const file: Either<Error, string> = pipe(
            fromNullable(flags.file),
            chain(isEmpty),
            fold(
                () => pipe(env.ACHIEVEMENTS_JSON,
                    fold(
                        () => left(Error(ANALYZER_ERRORS.NO_ACHIEVEMENTS_JSON_SPECIFIED)),
                        f => right(f))
                ),
                f => right(f)
            )
        )

        if (isLeft(file))
            return console.error(file.left.message);


        pipe(
            () => analyzer.validateList(file.right),
            te.fold(e => te.of(log.error(e.message)), m => te.of(log.success(m)))
        )()

    }
}
