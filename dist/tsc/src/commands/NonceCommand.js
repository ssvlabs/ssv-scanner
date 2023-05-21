"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceCommand = void 0;
const tslib_1 = require("tslib");
const Command_1 = require("./Command");
const NonceScanner_1 = require("../lib/NonceScanner/NonceScanner");
class NonceCommand extends Command_1.Command {
    constructor() {
        super('nonce', 'Handles nonce operations');
    }
    setArguments(parser) {
        parser.add_argument('-n', '--node-url', {
            help: `The ETH1 node url.`,
            required: true,
            dest: 'nodeUrl'
        });
        parser.add_argument('-ca', '--ssv-contract-address', {
            help: 'The SSV Contract address, used to find the latest cluster data snapshot. ' +
                'Refer to https://docs.ssv.network/developers/smart-contracts',
            required: true,
            dest: 'contractAddress'
        });
        parser.add_argument('-oa', '--owner-address', {
            help: "The owner address regarding the cluster that you want to query",
            required: true,
            dest: 'ownerAddress'
        });
    }
    run(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const nonceScanner = new NonceScanner_1.NonceScanner(args);
                const result = yield nonceScanner.run(true);
                console.log('Owner nonce:', result);
            }
            catch (e) {
                console.error('\x1b[31m', e.message);
            }
        });
    }
}
exports.NonceCommand = NonceCommand;
//# sourceMappingURL=NonceCommand.js.map