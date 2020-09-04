import { Command, flags } from '@oclif/command'
import { isNone } from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { Changeset as changeset, Version as version } from '../../services'
import env from '../../shared/env';
import { Logger as log } from '../../shared/logger';
import { THunk } from '../../core/definitions';
import { sequenceS } from 'fp-ts/lib/Apply';

const CHANGESET_ERRORS = {
    CHANGESET_DIR_ENV_VAR_NOT_SET: `CHANGESET_DIR env var is not set`,
    VERSIONS_DIR_ENV_VAR_NOT_SET: `VERSIONS_DIR env var not set`
}

const CHANGESET_MESSAGES = {
    CHANGESET_COMMIT_SUCCESSFUL: (newVer: string) => `The changeset was commited successfully. New version created at: \n${newVer}`
}

enum EChangesetCommands {
    GEN = 'gen',
    COMMIT = 'commit'
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
            options: ['gen', 'commit']
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

        if (isNone(versionsDir))
            return log.error(CHANGESET_ERRORS.VERSIONS_DIR_ENV_VAR_NOT_SET);

        if (isNone(changesetsDir))
            return log.error(CHANGESET_ERRORS.CHANGESET_DIR_ENV_VAR_NOT_SET);

        const mostRecentChangesetHunks = pipe(
            changeset.getMostRecent(changesetsDir.value),
            e.chain(changeset.validate),
            e.chain(changeset.getChangedHunks)
        )

        switch (command) {
            case EChangesetCommands.GEN:
                const writeToCsv = (c: THunk[]) =>
                    changeset.writeToCsv(versionsDir.value, changesetsDir.value, c)
                return pipe(
                    mostRecentChangesetHunks,
                    e.chain(writeToCsv),
                    e.fold(
                        err => e.of(log.error(err.message)),
                        m => e.of(log.success(m))
                    )
                )
            case EChangesetCommands.COMMIT:

                return pipe(
                    sequenceS(e.either)({
                        m: pipe(
                            mostRecentChangesetHunks,
                            e.chain(h => changeset.toCommandList(h))
                        ),
                        nvn: version.newVersionNumber(versionsDir.value)
                    }),
                    e.chain(({ m, nvn }) => version.create(m, nvn, versionsDir.value)),
                    e.fold(
                        err => e.of(log.error(err.message)),
                        nv => e.of(log.success(CHANGESET_MESSAGES.CHANGESET_COMMIT_SUCCESSFUL(nv))
                        )
                    ))
        }
    }
}