"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const argparse_1 = require("argparse");
class Command {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.env = '';
        this.parser = new argparse_1.ArgumentParser({ description: this.description });
        this.setArguments(this.parser);
    }
    /**
     * Parse args custom logic
     * @param args
     */
    parse(args) {
        // Remove command name itself
        args.splice(0, 1);
        // Remove stage env from network name
        const modifiedArgs = args.map((arg) => {
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
}
exports.Command = Command;
//# sourceMappingURL=Command.js.map