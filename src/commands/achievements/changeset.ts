import { Command, flags } from '@oclif/command'
import { isNone } from 'fp-ts/lib/Option';
import { chain, fold, of } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { Changeset as changeset } from '../../services'
import env from '../../shared/env';
import { Logger as log } from '../../shared/logger';

const CHANGESET_ERRORS = {
    CHANGESET_DIR_ENV_VAR_NOT_SET: `CHANGESET_DIR env var is not set`
}

export default class Changeset extends Command {
    static description = 'Perform actions on Achievement List Changesets'

    static examples = [
        `$ pcli achievements:changeset`,
    ]

    static flags = {
        help: flags.help({ char: 'h' })
    }

    async run() {

        const changesetsDir = env.CHANGESETS_DIR

        if (isNone(changesetsDir))
            return log.error(CHANGESET_ERRORS.CHANGESET_DIR_ENV_VAR_NOT_SET);

        pipe(
            changeset.getMostRecent(changesetsDir.value),
            chain(b => changeset.validate(b)),
            fold(
                e => of(log.error(e.message)),
                m => of(log.success(m))
            )
        )
    }
}