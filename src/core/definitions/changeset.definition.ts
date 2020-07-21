import * as t from 'io-ts'
import * as e from 'fp-ts/lib/Either'
import * as o from 'fp-ts/lib/Option'
import * as fs from 'fs';
import { pipe } from 'fp-ts/lib/pipeable';

import env from '../../shared/env';
import { Parser as parse } from '../../services';
import { RAchievement } from './achievement.definition';

export const RChangeset = t.intersection([
    RAchievement,
    t.type({
        NewPoints: t.string,
        NewCategory: t.string,
        NewName: t.string,
        Duplicate: t.boolean
    })
])

export type TChangeset = t.TypeOf<typeof RChangeset>