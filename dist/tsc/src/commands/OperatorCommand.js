"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorCommand = void 0;
const Command_1 = require("./Command");
const OperatorScanner_1 = require("../lib/OperatorScanner/OperatorScanner");
class OperatorCommand extends Command_1.Command {
    constructor() {
        super('operator', 'Handles cluster operations');
    }
    setArguments(parser) {
        parser.add_argument('-nw', '--network', {
            help: 'The network',
            choices: ['mainnet', 'holesky'],
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
        parser.add_argument('-o', '--output-path', {
            help: `The output path for the operator data`,
            required: false,
            dest: 'outputPath'
        });
    }
    async run(args) {
        try {
            const operatorScanner = new OperatorScanner_1.OperatorScanner(args);
            const outputPath = args.outputPath;
            const result = await operatorScanner.run(outputPath, true);
            console.log(result);
        }
        catch (e) {
            console.error('\x1b[31m', e.message);
        }
    }
}
exports.OperatorCommand = OperatorCommand;
//# sourceMappingURL=OperatorCommand.js.map