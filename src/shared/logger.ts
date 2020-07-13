import * as colors from 'colors';

export class Logger {
    static error = (message: string) => {
        console.log(colors.red.bold(message));
    }

    static success = (message: string) => {
        console.log(colors.green(message));
    }
}