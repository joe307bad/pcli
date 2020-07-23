import * as t from 'io-ts'

import { RAchievement } from './achievement.definition';

export const RChangeset = t.intersection([
    RAchievement,
    t.type({
        newPoints: t.union([t.string, t.undefined]),
        newCategory: t.union([t.string, t.undefined]),
        newName: t.union([t.string, t.undefined])
    })
])

export type TChangeset = t.TypeOf<typeof RChangeset>