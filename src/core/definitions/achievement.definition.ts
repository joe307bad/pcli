import * as t from 'io-ts'
import * as e from 'fp-ts/lib/Either'
import * as o from 'fp-ts/lib/Option'
import * as fs from 'fs';
import { pipe } from 'fp-ts/lib/pipeable';

import env from '../../shared/env';
import { Parser as parse } from '../../services';

const CATEGORY_ERRORS = (filePath: string) => ({
    ENVIRONMENT_VAR_NOT_SET: `Could not read environment variable for Categories JSON file`,
    ERROR_GETTING_FILE: `Error reading Category JSON file. File path: \n${filePath}\n}`,
    CATEGORY_DOES_NOT_EXIST: (category: unknown) => `Category "${category}" does not exist in the Categories JSON file located here:\n${filePath}`
});

const RCategory = t.type({
    name: t.string
});

type TCategory = t.TypeOf<typeof RCategory>;

const RExistentCategory =
    new t.Type<string, string, unknown>(
        'RExistentCategory',
        (category): category is string => typeof category === 'string',
        (category, c) => {
            const categoriesJsonFile = pipe(
                env.CATEGORIES_JSON_FILE,
                o.getOrElse(() => '')
            );

            const categoryErrors = CATEGORY_ERRORS(categoriesJsonFile);

            const isCategoriesJsonFileEnvVarSet = e.fromOption(() =>
                Error(categoryErrors.ENVIRONMENT_VAR_NOT_SET))(env.CATEGORIES_JSON_FILE)

            const availableCategories = (s: Buffer) =>
                parse.JSONSync<TCategory[]>(
                    s.toString(), categoriesJsonFile, t.array(RCategory).decode
                )

            const isCategoryExistent = (category: unknown, categories: TCategory[]) =>
                categories.some(c => c.name === category)
                    ? e.right(true)
                    : e.left(Error(categoryErrors.CATEGORY_DOES_NOT_EXIST(category)))


            const isValidCategory = pipe(
                isCategoriesJsonFileEnvVarSet,
                e.chain(j => e.tryCatch(
                    () => fs.readFileSync(j),
                    err => e.toError(categoryErrors.ERROR_GETTING_FILE))
                ),
                e.chain(e => {
                    const b = availableCategories(e)
                    // debugger;
                    return b;
                }),
                e.chain(categories => isCategoryExistent(category, categories))
            )

            if (e.isLeft(isValidCategory)) {
                // debugger;
            }
            if (e.isLeft(isValidCategory))
                return t.failure(category, c)

            return t.success(category as string);

        },
        t.identity
    )

// Ordering matters here so input CSV and 
// output CSV have same column order
export const RAchievement = t.type({
    description: t.string,
    name: t.string,
    points: t.number,
    photo: t.union([t.string, t.null]),
    category: RExistentCategory
});

export type TAchievement = t.TypeOf<typeof RAchievement>;