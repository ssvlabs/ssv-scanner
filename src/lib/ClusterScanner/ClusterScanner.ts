import { ethers } from 'ethers';
import cliProgress from 'cli-progress';
import { getContractSettings } from '../contract.provider';

import { BaseScanner } from '../BaseScanner';

export interface IData {
  payload: any;
  cluster: any;
}

export class ClusterScanner extends BaseScanner {
  async run(operatorIds: number[], isCli?: boolean): Promise<IData> {
    const validOperatorIds = Array.isArray(operatorIds) && this._isValidOperatorIds(operatorIds.length);
    if (!validOperatorIds) {
      throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
    }

    operatorIds = [...operatorIds].sort((a: number, b: number) => a - b);

    if (isCli) {
      console.log('\nScanning blockchain...');
      this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    }
    const data: IData = await this._getClusterSnapshot(operatorIds, isCli);
    isCli && this.progressBar.stop();
    return data;
  }

  private async _getClusterSnapshot(operatorIds: number[], isCli?: boolean): Promise<IData> {
    const { contractAddress, abi, genesisBlock } = getContractSettings(this.params.network);
    let latestBlockNumber;
    const provider = new ethers.JsonRpcProvider(this.params.nodeUrl);

    try {
      latestBlockNumber = await provider.getBlockNumber();
    } catch (err) {
      throw new Error('Could not access the provided node endpoint: ' + err);
    }

    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
      await contract.owner();
    } catch (err) {
      throw new Error('Could not find any cluster snapshot from the provided contract address: ' + err);
    }

    let step = this.MONTH;
    let clusterSnapshot;
    let biggestBlockNumber = 0;
    let transactionIndex = 0;

    const eventsList = ['ClusterDeposited', 'ClusterWithdrawn', 'ValidatorRemoved', 'ValidatorAdded', 'ClusterLiquidated', 'ClusterWithdrawn'];

    isCli && this.progressBar.start(latestBlockNumber, genesisBlock);

    const operatorIdsAsString = JSON.stringify(operatorIds);
    let prevProgressBarState = genesisBlock;
    for (let startBlock = latestBlockNumber; startBlock > genesisBlock && !clusterSnapshot; startBlock -= step) {
      const endBlock = Math.max(startBlock - step + 1, genesisBlock)
      try {
        const filter = {
          address: contractAddress,
          fromBlock: endBlock,
          toBlock: startBlock
        };
        const logs = await provider.getLogs(filter);

        logs
          .map(log => ({
            event: contract.interface.parseLog(log),
            blockNumber: log.blockNumber,
            transactionIndex: log.transactionIndex
          }))
          .filter((parsedEvent) => parsedEvent.event && eventsList.includes(parsedEvent.event.name))
          .filter((parsedLog) => JSON.stringify((parsedLog.event?.args.operatorIds.map((bigIntOpId: bigint) => Number(bigIntOpId)))) === operatorIdsAsString && parsedLog.event?.args.some((value: any) => ethers.isAddress(value) && ethers.getAddress(value) === this.params.ownerAddress))
          .sort((a, b) => a.blockNumber - b.blockNumber)
          .forEach((parsedLog: any) => {
            if (parsedLog.blockNumber >= biggestBlockNumber) {
              const previousBlockNumber = biggestBlockNumber;
              biggestBlockNumber = parsedLog.blockNumber;

              if (previousBlockNumber === parsedLog.blockNumber && parsedLog.transactionIndex < transactionIndex) {
                return;
              }

              transactionIndex = parsedLog.transactionIndex;
              clusterSnapshot = parsedLog.event.args.cluster;
            }
          });
      } catch (e) {
        if (step === this.MONTH) {
          step = this.WEEK;
          startBlock += this.WEEK;
        } else if (step === this.WEEK) {
          step = this.DAY;
          startBlock += this.DAY;        }
      }
      prevProgressBarState += step;
      isCli && this.progressBar.update(prevProgressBarState, latestBlockNumber);
    }

    isCli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
    clusterSnapshot = clusterSnapshot || ['0', '0', '0', true, '0'];
    return {
      payload: {
        'Owner': this.params.ownerAddress,
        'Operators': operatorIds.join(','),
        'Block': biggestBlockNumber || latestBlockNumber,
        'Data': clusterSnapshot.join(',')
      },
      cluster: {
        validatorCount: Number(clusterSnapshot[0]),
        networkFeeIndex: clusterSnapshot[1].toString(),
        index: clusterSnapshot[2].toString(),
        active: clusterSnapshot[3],
        balance: clusterSnapshot[4].toString()
      }
    };
  }

  private _isValidOperatorIds(operatorsLength: number) {
    return !(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1);
  }
}
