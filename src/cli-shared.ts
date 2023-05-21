import figlet from 'figlet';
import pkg from '../package.json';
import { ArgumentParser } from 'argparse';

import { SSVScannerCommand } from './commands/SSVScannerCommand';

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
  const parser = new ArgumentParser();

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
  parser.add_argument('-oids', '--operator-ids', {
    help: `Comma-separated list of operators IDs regarding the cluster that you want to query`,
    required: true,
    dest: 'operatorIds'
  });


  const messageText = `Cluster Scanner v${pkg.version}`;
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

  try {
    let params = parser.parse_args();
    params.operatorIds = params.operatorIds.split(',')
      .map((value: any) => {
        if (Number.isNaN(+value)) throw new Error('Operator Id should be the number');
        return +value;
      })
      .sort((a: number, b: number) => a - b);

    const command = new SSVScannerCommand(params);
    const result = await command.execute();
    console.table(result.payload);
    console.log('\Cluster snapshot:');
    console.table(result.cluster);
    console.log(JSON.stringify({
      "block": result.payload.Block,
      "cluster snapshot": result.cluster,
      "cluster": Object.values(result.cluster)
    }, null, '  '));
  } catch (e: any) {
    console.error('\x1b[31m', e.message);
  }
}
