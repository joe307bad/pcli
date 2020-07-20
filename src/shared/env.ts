import { Option, some, none } from "fp-ts/lib/Option";

const {
    ACHIEVEMENTS_JSON_FILE,
    CATEGORIES_JSON_FILE,
    CHANGESETS_DIR
} = process.env;

interface IEnv {
    ACHIEVEMENTS_JSON_FILE: Option<string>
    CATEGORIES_JSON_FILE: Option<string>
    CHANGESETS_DIR: Option<string>
}

const toOption = (key: any) => key ? some(key) : none;

const env: IEnv = {
    ACHIEVEMENTS_JSON_FILE: toOption(ACHIEVEMENTS_JSON_FILE),
    CATEGORIES_JSON_FILE: toOption(CATEGORIES_JSON_FILE),
    CHANGESETS_DIR: toOption(CHANGESETS_DIR)
}

export default env;