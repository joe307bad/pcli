import { Option, fromNullable } from 'fp-ts/lib/Option'

const {
  ACHIEVEMENTS_JSON_FILE,
  CATEGORIES_JSON_FILE,
  CHANGESETS_DIR,
  VERSIONS_DIR
} = process.env

interface IEnv {
  ACHIEVEMENTS_JSON_FILE: Option<string>;
  CATEGORIES_JSON_FILE: Option<string>;
  CHANGESETS_DIR: Option<string>;
  VERSIONS_DIR: Option<string>;
}

const env: IEnv = {
  ACHIEVEMENTS_JSON_FILE: fromNullable(ACHIEVEMENTS_JSON_FILE),
  CATEGORIES_JSON_FILE: fromNullable(CATEGORIES_JSON_FILE),
  CHANGESETS_DIR: fromNullable(CHANGESETS_DIR),
  VERSIONS_DIR: fromNullable(VERSIONS_DIR),
}

export default env
