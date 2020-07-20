import * as t from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';
import { pipe } from 'fp-ts/lib/pipeable'
import { Either, fold, left, right, fromNullable } from 'fp-ts/lib/Either'
import * as parse from 'csv-parse/lib/sync';

const PARSER_ERROR = {
    ERROR_PARSING_JSON_FILE: (fileName: string, error: string) => `Error parsing JSON file ${fileName}\n${error}`,
    ERROR_DECODING_JSON: (errors: t.ValidationError[], fileName: string) => [
        `There was a mismatched type while decoding the file ${fileName}`,
        ...failure(errors)
    ].join("\n"),
    ERROR_PARSING_CSV_BUFFER: (err?: any) => `Error parsing CSV buffer. ${err ? `Error:\n${err.toString()}` : ``}`
}

type TDecoder<A> = (i: unknown) => Either<t.Errors, A>;

export class Parser {
    static JSON = <T>(json: string, fileName: string, decoder: TDecoder<T>) =>
        new Promise<Either<Error, T>>(resolve => {
            try {
                const parsed = JSON.parse(json);
                pipe(
                    decoder(parsed),
                    fold(
                        errors => resolve(
                            left(Error(PARSER_ERROR.ERROR_DECODING_JSON(errors, fileName)))
                        ),
                        decoded => resolve(right(decoded))
                    )
                );
            } catch (e) {
                resolve(left(Error(PARSER_ERROR.ERROR_PARSING_JSON_FILE(fileName, e))));
            }
        })
    static JSONSync = <T>(json: string, fileName: string, decoder: TDecoder<T>) => {
        try {
            const parsed = JSON.parse(json);
            return pipe(
                decoder(parsed),
                fold(
                    errors =>
                        left(Error(PARSER_ERROR.ERROR_DECODING_JSON(errors, fileName))),
                    decoded => right(decoded)
                )
            );
        } catch (e) {
            return left(Error(PARSER_ERROR.ERROR_PARSING_JSON_FILE(fileName, e)));
        }
    }
    static csvSync = <T>(buffer: Buffer): Either<Error, T> => {
        try {
            const parsed = parse(buffer);
            return pipe(
                fromNullable(Error(PARSER_ERROR.ERROR_PARSING_CSV_BUFFER()))(parsed),
                fold(
                    err => left(err),
                    decoded => right(decoded)
                )
            );
        } catch (e) {
            return left(Error(PARSER_ERROR.ERROR_PARSING_CSV_BUFFER(e)));
        };
    }
}