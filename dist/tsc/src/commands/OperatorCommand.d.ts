import { ArgumentParser } from 'argparse';
import { Command } from './Command';
export declare class OperatorCommand extends Command {
    constructor();
    setArguments(parser: ArgumentParser): void;
    run(args: any): Promise<void>;
}
