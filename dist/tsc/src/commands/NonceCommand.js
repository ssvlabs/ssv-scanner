"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceCommand = void 0;
const Command_1 = require("./Command");
const NonceScanner_1 = require("../lib/NonceScanner/NonceScanner");
class NonceCommand extends Command_1.Command {
    constructor() {
        super('nonce', 'Handles nonce operations');
    }
    setArguments(parser) {
        parser.add_argument('-nw', '--network', {
            help: 'The network',
            choices: ['mainnet', 'holesky', 'hoodi'],
            required: true,
            dest: 'network',
        });
        parser.add_argument('-n', '--node-url', {
            help: `ETH1 (execution client) node endpoint url`,
            required: true,
            dest: 'nodeUrl'
        });
        parser.add_argument('-oa', '--owner-address', {
            help: "The cluster owner address (in the SSV contract)",
            required: true,
            dest: 'ownerAddress'
        });
    }
    async run(args) {
        try {
            const nonceScanner = new NonceScanner_1.NonceScanner(args);
            const result = await nonceScanner.run(true);
            console.log('Next Nonce:', result);
        }
        catch (e) {
            console.error('\x1b[31m', e.message);
        }
    }
}
exports.NonceCommand = NonceCommand;
//# sourceMappingURL=NonceCommand.js.map