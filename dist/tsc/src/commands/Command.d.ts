import { ArgumentParser } from 'argparse';
export declare abstract class Command {
    name: string;
    protected description: string;
    protected parser: ArgumentParser;
    constructor(name: string, description: string);
    abstract setArguments(parser: ArgumentParser): void;
    parse(args: string[]): any;
    abstract run(args: any): void;
}
