import { fromNullable, Option, none, fold, some } from "fp-ts/lib/Option";
import { pipe } from 'fp-ts/lib/pipeable';

export default (s?: string): Option<string> => pipe(
    fromNullable(s),
    fold(
        () => none,
        s => s.trim() === '' ? none : some(s)
    )
)