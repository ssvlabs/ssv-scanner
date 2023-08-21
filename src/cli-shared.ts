import figlet from 'figlet';
import pkg from '../package.json';
import { ArgumentParser } from 'argparse';

import { NonceCommand } from './commands/NonceCommand';
import { ClusterCommand } from './commands/ClusterCommand';
// import { SSVScannerCommand } from './commands/SSVScannerCommand';

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
  const mainParser = new ArgumentParser();
  
  const subparsers = mainParser.add_subparsers({ title: 'commands', dest: 'command' });
  
  const clusterCommand = new ClusterCommand();
  const nonceCommand = new NonceCommand();
  
  clusterCommand.setArguments(subparsers.add_parser(clusterCommand.name, { add_help: true }));
  nonceCommand.setArguments(subparsers.add_parser(nonceCommand.name, { add_help: true }));
  
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

  const args = mainParser.parse_args();
  
  switch (args.command) {
    case clusterCommand.name:
      await clusterCommand.run(args);
      break;
    case nonceCommand.name:
      await nonceCommand.run(args);
      break;
    default:
      console.error('Command not found');
      process.exit(1);
  }
}
