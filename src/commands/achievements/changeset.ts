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

export default class Changeset extends Command {
    static description = 'Perform actions on a Changesets for an Achievement List'

    static examples = [
        `$ pcli achievements:changeset`,
    ]

    static flags = {
        help: flags.help({ char: 'h' })
    }

    async run() {

        const changesetsDir = env.CHANGESETS_DIR
        const versionsDir = env.VERSIONS_DIR

        if (isNone(changesetsDir))
            return log.error(CHANGESET_ERRORS.CHANGESET_DIR_ENV_VAR_NOT_SET);

        if (isNone(versionsDir))
            return log.error(CHANGESET_ERRORS.VERSIONS_DIR_ENV_VAR_NOT_SET);

        const writeToCsv = (c: THunk[]) =>
            changeset.writeToCsv(versionsDir.value, changesetsDir.value, c)

        // TODO why can this not be run twice in a row? the produced CSV 
        // does not pass validation for some reason
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