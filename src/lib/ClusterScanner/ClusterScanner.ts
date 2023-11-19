import cliProgress from 'cli-progress';
import { ContractProvider, ContractVersion } from '../contract.provider';

import { BaseScanner } from '../BaseScanner';

export interface IData {
  payload: any;
  cluster: any;
}

export class ClusterScanner extends BaseScanner {
  protected eventsList = [
    'ClusterDeposited',
    'ClusterWithdrawn',
    'ValidatorRemoved',
    'ValidatorAdded',
    'ClusterLiquidated',
    'ClusterReactivated',
  ]

  async run(operatorIds: number[], cli?: boolean): Promise<IData> {
    const validOperatorIds = Array.isArray(operatorIds) && this._isValidOperatorIds(operatorIds.length);
    if (!validOperatorIds) {
      throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
    }

    operatorIds = [...operatorIds].sort((a: number, b: number) => a - b);

    if (cli) {
      console.log('\nScanning blockchain...');
      this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    }
    const data: IData = await this._getClusterSnapshot(operatorIds, cli);
    cli && this.progressBar.stop();
    return data;
  }

  private async _getClusterSnapshot(operatorIds: number[], cli?: boolean): Promise<IData> {
    let latestBlockNumber;
    const [networkEnv, networkGroup] = ContractVersion[this.params.network.toUpperCase() as keyof typeof ContractVersion].split(':');
    const contractProvider = new ContractProvider(networkEnv, networkGroup, this.params.nodeUrl);
    try {
      latestBlockNumber = await contractProvider.web3.eth.getBlockNumber();
    } catch (err) {
      throw new Error('Could not access the provided node endpoint: ' + err);
    }
    try {
      await contractProvider.contractCore.methods.owner().call();
      // HERE we can validate the contract owner address
    } catch (err) {
      throw new Error('Could not find any cluster snapshot from the provided contract address: ' + err);
    }
    let step = this.MONTH;
    let clusterSnapshot;
    let biggestBlockNumber = 0;
    let transactionIndex = 0;

    const genesisBlock = contractProvider.genesisBlock;
    const ownerTopic = contractProvider.web3.eth.abi.encodeParameter('address', this.params.ownerAddress);
    const filters = {
      fromBlock: Math.max(latestBlockNumber - step, genesisBlock),
      toBlock: latestBlockNumber,
      topics: [null, ownerTopic],
    };

    cli && this.progressBar.start(latestBlockNumber, 0);
    while (!clusterSnapshot && filters.fromBlock >= genesisBlock) {
      let result: any;
      try {
        result = await contractProvider.contractCore.getPastEvents('allEvents', filters);
        result
          .filter((item: any) => this.eventsList.includes(item.event))
          .filter((item: any) => JSON.stringify(item.returnValues.operatorIds.map((value: any) => +value)) === JSON.stringify(operatorIds))
          .sort((a: any, b: any) => a.blockNumber - b.blockNumber)  // Sort by blockNumber in ascending order
          .forEach((item: any) => {
            if (item.blockNumber >= biggestBlockNumber) {
              const previousBlockNumber = biggestBlockNumber;
              biggestBlockNumber = item.blockNumber;
              // same block number case to compare transactionIndex in block
              if (previousBlockNumber === item.blockNumber && item.transactionIndex < transactionIndex) {
                return;
              }
              transactionIndex = item.transactionIndex; // to use only for the case multiple events in one block number
              clusterSnapshot = item.returnValues.cluster;
            }
          });
        filters.toBlock = filters.fromBlock;
      } catch (e) {
        console.error(e);
        if (step === this.MONTH) {
          step = this.WEEK;
        } else if (step === this.WEEK) {
          step = this.DAY;
        }
      }
      filters.fromBlock = filters.toBlock - step;
      cli && this.progressBar.update(latestBlockNumber - (filters.toBlock - step));
    }
    cli && this.progressBar.update(latestBlockNumber, latestBlockNumber);

    clusterSnapshot = clusterSnapshot || ['0', '0', '0', true, '0'];
    return {
      payload: {
        'Owner': this.params.ownerAddress,
        'Operators': operatorIds.sort((a: number, b: number) => a - b).join(','),
        'Block': biggestBlockNumber || latestBlockNumber,
        'Data': clusterSnapshot.join(','),
      },
      cluster: {
        validatorCount: clusterSnapshot[0],
        networkFeeIndex: clusterSnapshot[1],
        index: clusterSnapshot[2],
        active: clusterSnapshot[3],
        balance: clusterSnapshot[4],
      }
    };
  }

  private _isValidOperatorIds(operatorsLength: number) {
    return (!(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1));
  }
}
