import * as R from 'remeda';
import * as fs from 'fs';
import * as path from 'path';

export const getMostRecentFile = (files: string[], dir: string, extension: string) => R.pipe(
    files,
    R.filter((a: string) => path.extname(a) === extension),
    R.sort((a: string, b: string) => {
        var fullpath = path.join(dir, a);
        var otherFullPath = path.join(dir, b);
        const creationTime = fs.statSync(fullpath).ctime;
        const otherCreationTime = fs.statSync(otherFullPath).ctime
        return otherCreationTime.getTime() - creationTime.getTime();
    }),
    R.first()
)