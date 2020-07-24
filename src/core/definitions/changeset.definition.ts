import * as t from 'io-ts'

import { RAchievement } from './achievement.definition';

export const NewProperties = {
    newPoints: t.string,
    newCategory: t.string,
    newName: t.string
}

export const TNewProperties = t.type(NewProperties);

export const RHunk = t.intersection([
    RAchievement,
    t.partial(NewProperties)
])

export type THunk = t.TypeOf<typeof RHunk>