import { ArgumentParser } from 'argparse';

export abstract class Command {
  protected parser: ArgumentParser;

  constructor(public name: string, protected description: string) {
    this.parser = new ArgumentParser({ description: this.description });
    this.setArguments(this.parser);
  }

  abstract setArguments(parser: ArgumentParser): void;

  parse(args: string[]) {
    return this.parser.parse_args(args);
  }

  abstract run(args: any): void;
}