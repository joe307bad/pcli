import { Parser as parse } from '../parser.service';
import { promises as fs } from 'fs';

export class Analyzer {
    static async validateList(achievementsJsonFile: string) {
        const achievementsJson = await fs.readFile(achievementsJsonFile);
        // const parsedAchievements
        console.log(achievementsJson);
    }

    exportListToCsv() {

    }

    generateChangesetCsv() {

    }

    generateVersionJson() {

    }


}