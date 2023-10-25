import figlet from 'figlet';
import pkg from '../package.json';
import * as process from 'process';
import { ArgumentParser } from 'argparse';
import { NonceCommand } from './commands/NonceCommand';
import { ClusterCommand } from './commands/ClusterCommand';

const FigletMessage = async (message: string) => {
  return new Promise(resolve => {
    figlet(message, (error: any, output?: string) => {
      if (error) {
        return resolve('');
      }
      resolve(output);
    });
  })
}

export default async function main(): Promise<any> {
  const messageText = `SSV Scanner v${pkg.version}`;
  const message = await FigletMessage(messageText);
  if (message) {
    console.log(' -----------------------------------------------------------------------------------');
    console.log(`${message || messageText}`);
    console.log(' -----------------------------------------------------------------------------------');
    for (const str of String(pkg.description).match(/.{1,75}/g) || []) {
      console.log(` ${str}`);
    }
    console.log(' -----------------------------------------------------------------------------------\n');
  }

  const rootParser = new ArgumentParser();
  const subParsers = rootParser.add_subparsers({ title: 'commands', dest: 'command' });

  const clusterCommand = new ClusterCommand();
  const nonceCommand = new NonceCommand();
  const clusterCommandParser = subParsers.add_parser(clusterCommand.name, { add_help: true })
  const nonceCommandParser = subParsers.add_parser(nonceCommand.name, { add_help: true });

  let command = '';
  const args = process.argv.slice(2); // Skip node and script name

  if (args[1] && args[1].includes('--help')) {
    clusterCommand.setArguments(clusterCommandParser);
    nonceCommand.setArguments(nonceCommandParser);
    rootParser.parse_args(); // Print help and exit
  } else {
    let args = rootParser.parse_known_args();
    command = args[0]['command'];
    clusterCommand.setArguments(clusterCommandParser);
    nonceCommand.setArguments(nonceCommandParser);
  }

  switch (command) {
    case clusterCommand.name:
      await clusterCommand.run(clusterCommand.parse(args));
      break;
    case nonceCommand.name:
      await nonceCommand.run(nonceCommand.parse(args));
      break;
    default:
      console.error('Command not found');
      process.exit(1);
  }
}
