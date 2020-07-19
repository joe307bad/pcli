import { Option, some, none } from "fp-ts/lib/Option";

const {
    ACHIEVEMENTS_JSON_FILE,
    CATEGORIES_JSON_FILE
} = process.env;

interface IEnv {
    ACHIEVEMENTS_JSON_FILE: Option<string>
    CATEGORIES_JSON_FILE: Option<string>
}

const toOption = (key: any) => key ? some(key) : none;

const env: IEnv = {
    ACHIEVEMENTS_JSON_FILE: toOption(ACHIEVEMENTS_JSON_FILE),
    CATEGORIES_JSON_FILE: toOption(CATEGORIES_JSON_FILE)
}

export default env;