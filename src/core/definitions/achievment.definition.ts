import * as t from 'io-ts'

// TODO Validate achievement categories based on JSON file of categories
export const RAchievement = t.type({
    name: t.string,
    description: t.string,
    category: t.string,
    points: t.number,
    photo: t.union([t.string, t.null])
});

export type TAchievement = t.TypeOf<typeof RAchievement>;