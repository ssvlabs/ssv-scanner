import { ArgumentParser } from 'argparse';

export abstract class Command {
  protected parser: ArgumentParser;
  protected env: string = '';

  protected constructor(public name: string, protected description: string) {
    this.parser = new ArgumentParser({ description: this.description });
    this.setArguments(this.parser);
  }

  abstract setArguments(parser: ArgumentParser): void;

  /**
   * Parse args custom logic
   * @param args
   */
  parse(args: any[]) {
    // Remove command name itself
    args.splice(0, 1);

    // Remove stage env from network name
    const modifiedArgs = args.map((arg: string) => {
      if (arg.endsWith('_stage')) {
        this.env = 'stage';
        arg = arg.replace('_stage', '');
      }
      return arg;
    });

    // Parse args without env and return env back after
    const parsedArgs = this.parser.parse_args(modifiedArgs);
    if (this.env) {
      parsedArgs.network += `_${this.env}`;
    }
    return parsedArgs;
  }

  abstract run(args: any): void;
}
