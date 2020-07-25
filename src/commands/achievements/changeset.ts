import { Command, flags } from '@oclif/command'
import { isNone } from 'fp-ts/lib/Option';
import { chain, fold, of } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { Changeset as changeset } from '../../services'
import env from '../../shared/env';
import { Logger as log } from '../../shared/logger';
import { THunk } from '../../core/definitions';

const CHANGESET_ERRORS = {
    CHANGESET_DIR_ENV_VAR_NOT_SET: `CHANGESET_DIR env var is not set`,
    VERSIONS_DIR_ENV_VAR_NOT_SET: `VERSIONS_DIR env var not set`
}

enum EChangesetCommands {
    GEN = 'gen'
}

export default class Changeset extends Command {
    static description = 'Perform actions on a Changesets for an Achievement List'

    static examples = [
        `$ pcli achievements:changeset`,
    ]

    static args = [
        {
            name: 'command',
            required: true,
            options: ['gen']
        }
    ]

    static flags = {
        help: flags.help({ char: 'h' })
    }

    async run() {

        const { args } = this.parse(Changeset)
        const changesetsDir = env.CHANGESETS_DIR
        const versionsDir = env.VERSIONS_DIR
        const command = args.command as EChangesetCommands;

        if (isNone(changesetsDir))
            return log.error(CHANGESET_ERRORS.CHANGESET_DIR_ENV_VAR_NOT_SET);

        if (isNone(versionsDir))
            return log.error(CHANGESET_ERRORS.VERSIONS_DIR_ENV_VAR_NOT_SET);

        const writeToCsv = (c: THunk[]) =>
            changeset.writeToCsv(versionsDir.value, changesetsDir.value, c)

        switch (command) {
            case EChangesetCommands.GEN:
                pipe(
                    changeset.getMostRecent(changesetsDir.value),
                    chain(b => changeset.validate(b)),
                    chain(b => changeset.getChangedHunks(b)),
                    chain(c => writeToCsv(c)),
                    fold(
                        e => of(log.error(e.message)),
                        m => of(log.success(m))
                    )
                )
        }
    }
}