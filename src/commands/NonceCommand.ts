import { ArgumentParser } from 'argparse';
import { Command } from './Command';
import { NonceScanner } from '../lib/NonceScanner/NonceScanner';

export class NonceCommand extends Command {
  constructor() {
    super('nonce', 'Handles nonce operations');
  }

  setArguments(parser: ArgumentParser): void {
    parser.add_argument('-n', '--node-url', {
      help: `The ETH1 node url.`,
      required: true,
      dest: 'nodeUrl'
    });
    parser.add_argument('-ca', '--ssv-contract-address', {
      help:
        'The SSV Contract address, used to find the latest cluster data snapshot. ' +
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

  async run(args: any): Promise<void> {
    try {
      const nonceScanner = new NonceScanner(args);
      const result = await nonceScanner.run(true);
      console.log('Owner nonce:', result);
    } catch (e: any) {
      console.error('\x1b[31m', e.message);
    }
  }
}