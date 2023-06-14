import { ArgumentParser } from 'argparse';
import { Command } from './Command';
import { ClusterScanner } from '../lib/ClusterScanner/ClusterScanner';

export class ClusterCommand extends Command {
  constructor() {
    super('cluster', 'Handles cluster operations');
  }

  setArguments(parser: ArgumentParser): void {
    parser.add_argument('-n', '--node-url', {
      help: `ETH1 (execution client) node endpoint url.`,
      required: true,
      dest: 'nodeUrl'
    });
    parser.add_argument('-ca', '--ssv-contract-address', {
      help:
        'The SSV network contract address. ' +
        'Refer to https://docs.ssv.network/developers/smart-contracts',
      required: true,
      dest: 'contractAddress'
    });
    parser.add_argument('-oa', '--owner-address', {
      help: "The cluster owner address (in the SSV contract)",
      required: true,
      dest: 'ownerAddress'
    });
    parser.add_argument('-oids', '--operator-ids', {
      help: `Comma-separated list of operators IDs regarding the cluster that you want to query`,
      required: true,
      dest: 'operatorIds'
    });  
  }

  async run(args: any): Promise<void> {
    try {
      const operatorIds = args.operatorIds.split(',')
        .map((value: any) => {
          if (Number.isNaN(+value)) throw new Error('Operator Id should be the number');
          return +value;
        })
        .sort((a: number, b: number) => a - b);
      const clusterScanner = new ClusterScanner(args);
      const result = await clusterScanner.run(operatorIds, true);
      console.table(result.payload);
      console.log('Cluster snapshot:');
      console.table(result.cluster);
      console.log(JSON.stringify({
        'block': result.payload.Block,
        'cluster snapshot': result.cluster,
        'cluster': Object.values(result.cluster)
      }, null, '  '));
    } catch (e: any) {
      console.error('\x1b[31m', e.message);
    }
  }
}