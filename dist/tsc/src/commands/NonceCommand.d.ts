import { ArgumentParser } from 'argparse';
import { Command } from './Command';
export declare class NonceCommand extends Command {
    constructor();
    setArguments(parser: ArgumentParser): void;
    run(args: any): Promise<void>;
}
