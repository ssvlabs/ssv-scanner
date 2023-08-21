"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const figlet_1 = tslib_1.__importDefault(require("figlet"));
const package_json_1 = tslib_1.__importDefault(require("../package.json"));
const argparse_1 = require("argparse");
const NonceCommand_1 = require("./commands/NonceCommand");
const ClusterCommand_1 = require("./commands/ClusterCommand");
// import { SSVScannerCommand } from './commands/SSVScannerCommand';
const FigletMessage = (message) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        (0, figlet_1.default)(message, (error, output) => {
            if (error) {
                return resolve('');
            }
            resolve(output);
        });
    });
});
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const mainParser = new argparse_1.ArgumentParser();
        const subparsers = mainParser.add_subparsers({ title: 'commands', dest: 'command' });
        const clusterCommand = new ClusterCommand_1.ClusterCommand();
        const nonceCommand = new NonceCommand_1.NonceCommand();
        clusterCommand.setArguments(subparsers.add_parser(clusterCommand.name, { add_help: true }));
        nonceCommand.setArguments(subparsers.add_parser(nonceCommand.name, { add_help: true }));
        const messageText = `SSV Scanner v${package_json_1.default.version}`;
        const message = yield FigletMessage(messageText);
        if (message) {
            console.log(' -----------------------------------------------------------------------------------');
            console.log(`${message || messageText}`);
            console.log(' -----------------------------------------------------------------------------------');
            for (const str of String(package_json_1.default.description).match(/.{1,75}/g) || []) {
                console.log(` ${str}`);
            }
            console.log(' -----------------------------------------------------------------------------------\n');
        }
        const args = mainParser.parse_args();
        switch (args.command) {
            case clusterCommand.name:
                yield clusterCommand.run(args);
                break;
            case nonceCommand.name:
                yield nonceCommand.run(args);
                break;
            default:
                console.error('Command not found');
                process.exit(1);
        }
    });
}
exports.default = main;
//# sourceMappingURL=cli-shared.js.map