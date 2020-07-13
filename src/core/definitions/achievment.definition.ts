import { AchievementDto } from 'points/Shared.Points';
import { type, string, number, union, undefined, TypeOf } from 'io-ts'

// TODO Validate achievement categories based on JSON file of categories
const RAchievement = type({
    name: string,
    description: string,
    category: string,
    points: number,
    photo: union([string, undefined])
});

type TAchievement = TypeOf<typeof RAchievement>;