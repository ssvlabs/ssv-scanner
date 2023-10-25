import { ArgumentParser } from 'argparse';
export declare abstract class Command {
    name: string;
    protected description: string;
    protected parser: ArgumentParser;
    protected env: string;
    protected constructor(name: string, description: string);
    abstract setArguments(parser: ArgumentParser): void;
    /**
     * Parse args custom logic
     * @param args
     */
    parse(args: any[]): any;
    abstract run(args: any): void;
}
