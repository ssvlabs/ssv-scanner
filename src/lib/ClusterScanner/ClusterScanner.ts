import cliProgress from 'cli-progress';
import Web3Provider from '../web3.provider';

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
    try {
      latestBlockNumber = await Web3Provider.web3(this.params.nodeUrl).eth.getBlockNumber();
    } catch (err) {
      throw new Error('Could not access the provided node endpoint.');
    }
    try {
      await Web3Provider.contract(this.params.nodeUrl, this.params.contractAddress).methods.owner().call();
      // HERE we can validate the contract owner address
    } catch (err) {
      console.log("eee", err);
      throw new Error('Could not find any cluster snapshot from the provided contract address.');
    }
    let step = this.MONTH;
    let clusterSnapshot;
    let biggestBlockNumber = 0;

    const genesisBlock = await Web3Provider.getGenesisBlock(this.params.nodeUrl, this.params.contractAddress);
    const ownerTopic = Web3Provider.web3().eth.abi.encodeParameter('address', this.params.ownerAddress);
    const filters = {
      fromBlock: Math.max(latestBlockNumber - step, genesisBlock),
      toBlock: latestBlockNumber,
      topics: [null, ownerTopic],
    };

    cli && this.progressBar.start(latestBlockNumber, 0);
    while (!clusterSnapshot && filters.fromBlock >= genesisBlock) {
      let result: any;
      try {
        result = await Web3Provider.contract(this.params.nodeUrl, this.params.contractAddress).getPastEvents('allEvents', filters);
        result
          .filter((item: any) => this.eventsList.includes(item.event))
          .filter((item: any) => JSON.stringify(item.returnValues.operatorIds.map((value: any) => +value)) === JSON.stringify(operatorIds))
          .forEach((item: any) => {
            if (item.blockNumber > biggestBlockNumber) {
              biggestBlockNumber = item.blockNumber;
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
    return (operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1) ? false : true;
  }
}
