import { ethers } from 'ethers';
import cliProgress from 'cli-progress';
import { getContractSettings } from '../contract.provider';

import { BaseScanner } from '../BaseScanner';

/** Cluster struct from contract (tuple): validatorCount, networkFeeIndex, index, active, balance */
const CLUSTER_KEYS = ['validatorCount', 'networkFeeIndex', 'index', 'active', 'balance'] as const;

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

    const eventsList = ['ClusterBalanceUpdated', 'ClusterDeposited', 'ClusterLiquidated', 'ClusterMigratedToETH', 'ClusterReactivated', 'ClusterWithdrawn', 'ValidatorAdded', 'ValidatorRemoved'];

    isCli && this.progressBar.start(latestBlockNumber, genesisBlock);

    const operatorIdsAsString = JSON.stringify(operatorIds);
    let prevProgressBarState = genesisBlock;
    for (let startBlock = latestBlockNumber; startBlock > genesisBlock && !clusterSnapshot; startBlock -= step) {
      const endBlock = Math.max(startBlock - step + 1, genesisBlock)
      try {
        const filter = {
          address: contractAddress,
          fromBlock: endBlock,
          toBlock: startBlock,
          topics: [null, ethers.zeroPadValue(this.params.ownerAddress, 32)],
        };
        const logs = await provider.getLogs(filter);
        console.log("[scanner] getLogs count: " + (logs?.length ?? 0));

        const parsedLogs = logs
          .map((log: ethers.Log) => ({
            event: contract.interface.parseLog(log),
            blockNumber: log.blockNumber,
            transactionIndex: log.transactionIndex,
            logIndex: log.index
          }));
        console.log("[scanner] parsed events count: " + (parsedLogs?.length ?? 0));
        if (parsedLogs?.length > 0) {
          const first = parsedLogs[0];
          console.log("[scanner] first parsed event: name=" + (first?.event?.name ?? "?") + ", block=" + (first?.blockNumber ?? "?"));
        }

        const res = parsedLogs
          .filter((parsedLog) => parsedLog.event && eventsList.includes(parsedLog.event.name))
          .filter((parsedLog) =>
            JSON.stringify((parsedLog.event?.args.operatorIds.map((bigIntOpId: bigint) => Number(bigIntOpId)))) === operatorIdsAsString
          )
          .sort((a, b) => {
            if (b.blockNumber === a.blockNumber) {
              if (b.transactionIndex === a.transactionIndex) {
                return b.logIndex - a.logIndex;
              } else {
                return b.transactionIndex - a.transactionIndex
              }
            } else {
              return b.blockNumber - a.blockNumber;
            }
          });
        console.log("[scanner] events for this owner+operatorIds (res length): " + (res?.length ?? 0));
        if (res?.length > 0) {
          console.log("[scanner] first res event: name=" + (res[0]?.event?.name ?? "?") + ", block=" + (res[0]?.blockNumber ?? "?"));
          if (res.length > 1) {
            console.log("[scanner] last res event: name=" + (res[res.length - 1]?.event?.name ?? "?") + ", block=" + (res[res.length - 1]?.blockNumber ?? "?"));
          }
        }
        const latest = res[0];
        console.log("[scanner] latest event: name=" + (latest?.event?.name ?? "?") + ", block=" + (latest?.blockNumber ?? "?"));
        console.log("[scanner] latest present: " + !!latest + ", has event.args: " + !!(latest?.event?.args));
        if (latest?.event?.args) {
          console.log("Latest cluster" + latest.event.args.cluster);
          console.log("Normalized cluster" + clusterSnapshotToArray(latest.event.args.cluster));
          console.log("[scanner] cluster source: FROM_EVENT");
          clusterSnapshot = clusterSnapshotToArray(latest.event.args.cluster);
        }
      } catch (e) {
        if (step === this.MONTH) {
          step = this.WEEK;
          startBlock += this.WEEK;
        } else if (step === this.WEEK) {
          step = this.DAY;
          startBlock += this.DAY;
        }
      }
      prevProgressBarState += step;
      isCli && this.progressBar.update(prevProgressBarState, latestBlockNumber);
    }

    isCli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
    const cluster = clusterSnapshot ?? ['0', '0', '0', true, '0'];
    if (clusterSnapshot == null) {
      console.log("[scanner] cluster source: FALLBACK (no matching event)");
      console.log("[scanner] fallback cluster tuple: " + JSON.stringify(cluster));
    }
    const clusterArr = clusterSnapshotToArray(cluster);
    console.log("[scanner] final cluster source: " + (clusterSnapshot != null ? "FROM_EVENT" : "FALLBACK"));
    console.log("[scanner] final cluster tuple: " + JSON.stringify(clusterArr));
    return {
      payload: {
        'Owner': this.params.ownerAddress,
        'Operators': operatorIds.join(','),
        'Block': biggestBlockNumber || latestBlockNumber,
        'Data': clusterArr.join(',')
      },
      cluster: {
        validatorCount: Number(clusterArr[0]),
        networkFeeIndex: clusterArr[1].toString(),
        index: clusterArr[2].toString(),
        active: clusterArr[3],
        balance: clusterArr[4].toString()
      }
    };
  }

  private _isValidOperatorIds(operatorsLength: number) {
    return !(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1);
  }
}

/**
* Normalize the cluster from event args into a fixed 5-element array.
* We need to support two types of cluster structs because ethers can decode the same Solidity struct either way:
* - Tuple/array: cluster[0]..cluster[4] (older ABIs or some decode paths).
* - Named object: cluster.validatorCount, cluster.networkFeeIndex, etc. (newer ABIs / ethers v6).
* Reading by both index and key keeps the scanner correct regardless of which form we get,
* and we normalize bigints to strings so the rest of the code always sees a consistent type.
*/
function clusterSnapshotToArray(cluster: unknown): [string | number, string, string, boolean, string] {
  // If the cluster is not an object, return a default value
  if (!cluster || typeof cluster !== 'object') {
    return ['0', '0', '0', true, '0'];
  }
  // Cast the cluster to a record or array
  const c = cluster as Record<string, unknown> | unknown[];
  // Get the value at the given index or key
  const get = (i: number, key: string) => {
    const v = Array.isArray(c) ? c[i] : (c as Record<string, unknown>)[key];
    if (v === undefined || v === null) return i === 3 ? true : (i === 0 ? 0 : '0');
    if (i === 3) return Boolean(v);
    return typeof v === 'bigint' ? v.toString() : String(v);
  };
  // Return the normalized array
  return [
    get(0, CLUSTER_KEYS[0]) as string | number,
    get(1, CLUSTER_KEYS[1]) as string,
    get(2, CLUSTER_KEYS[2]) as string,
    get(3, CLUSTER_KEYS[3]) as boolean,
    get(4, CLUSTER_KEYS[4]) as string,
  ];
}
