import { Command, flags } from '@oclif/command'
import { Analyzer as analyzer } from '../../services';

export default class Analyzer extends Command {
    static description = 'Set of tools to analyze Achievements'

    static examples = [
        `$ pcli achievements:analyzer`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        file: flags.string({ char: 'f', description: 'Achievements JSON file' })
    }

    // static args = [{ name: 'file' }]

    async run() {
        const { args, flags } = this.parse(Analyzer)

        analyzer.validateList(flags.file || '');

    }
}
