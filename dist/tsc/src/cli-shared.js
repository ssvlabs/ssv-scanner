"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const figlet_1 = tslib_1.__importDefault(require("figlet"));
const package_json_1 = tslib_1.__importDefault(require("../package.json"));
const process = tslib_1.__importStar(require("process"));
const argparse_1 = require("argparse");
const NonceCommand_1 = require("./commands/NonceCommand");
const ClusterCommand_1 = require("./commands/ClusterCommand");
const OperatorCommand_1 = require("./commands/OperatorCommand");
const FigletMessage = async (message) => {
    return new Promise(resolve => {
        (0, figlet_1.default)(message, (error, output) => {
            if (error) {
                return resolve('');
            }
            resolve(output);
        });
    });
};
async function main() {
    const messageText = `SSV Scanner v${package_json_1.default.version}`;
    const message = await FigletMessage(messageText);
    if (message) {
        console.log(' -----------------------------------------------------------------------------------');
        console.log(`${message || messageText}`);
        console.log(' -----------------------------------------------------------------------------------');
        for (const str of String(package_json_1.default.description).match(/.{1,75}/g) || []) {
            console.log(` ${str}`);
        }
        console.log(' -----------------------------------------------------------------------------------\n');
    }
    const rootParser = new argparse_1.ArgumentParser();
    const subParsers = rootParser.add_subparsers({ title: 'commands', dest: 'command' });
    const clusterCommand = new ClusterCommand_1.ClusterCommand();
    const nonceCommand = new NonceCommand_1.NonceCommand();
    const operatorCommand = new OperatorCommand_1.OperatorCommand();
    const clusterCommandParser = subParsers.add_parser(clusterCommand.name, { add_help: true });
    const nonceCommandParser = subParsers.add_parser(nonceCommand.name, { add_help: true });
    const operatorCommandParser = subParsers.add_parser(operatorCommand.name, { add_help: true });
    let command = '';
    const args = process.argv.slice(2); // Skip node and script name
    if (args[1] && args[1].includes('--help')) {
        clusterCommand.setArguments(clusterCommandParser);
        nonceCommand.setArguments(nonceCommandParser);
        operatorCommand.setArguments(operatorCommandParser);
        rootParser.parse_args(); // Print help and exit
    }
    else {
        let args = rootParser.parse_known_args();
        command = args[0]['command'];
        clusterCommand.setArguments(clusterCommandParser);
        nonceCommand.setArguments(nonceCommandParser);
        operatorCommand.setArguments(operatorCommandParser);
    }
    switch (command) {
        case clusterCommand.name:
            await clusterCommand.run(clusterCommand.parse(args));
            break;
        case nonceCommand.name:
            await nonceCommand.run(nonceCommand.parse(args));
            break;
        case operatorCommand.name:
            await operatorCommand.run(operatorCommand.parse(args));
            break;
        default:
            console.error('Command not found');
            process.exit(1);
    }
}
exports.default = main;
//# sourceMappingURL=cli-shared.js.map