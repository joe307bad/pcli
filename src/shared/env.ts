import { Option, some, none } from "fp-ts/lib/Option";

const {
    ACHIEVEMENTS_JSON
} = process.env;

interface IEnv {
    ACHIEVEMENTS_JSON: Option<string>
}

const env: IEnv = {
    ACHIEVEMENTS_JSON: ACHIEVEMENTS_JSON ? some(ACHIEVEMENTS_JSON) : none
}

export default env;