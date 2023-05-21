import cliProgress from 'cli-progress';
import Web3Provider from '../lib/web3.provider';

export interface SSVScannerParams {
  nodeUrl: string,
  ownerAddress: string,
  contractAddress: string,
  operatorIds: number[],
}

export interface IData {
  payload: any;
  cluster: any;
}

export class SSVScannerCommand {
  protected DAY = 5400;
  protected WEEK = this.DAY * 7;
  protected MONTH = this.DAY * 30;
  protected progressBar: any;

  protected eventsList = [
    'ClusterDeposited',
    'ClusterWithdrawn',
    'ValidatorRemoved',
    'ValidatorAdded',
    'ClusterLiquidated',
    'ClusterReactivated',
  ]

  private params: SSVScannerParams;

  constructor(scannerParams: SSVScannerParams) {
    if (!scannerParams.contractAddress) {
      throw Error('Contract address is required');
    }
    if (!scannerParams.nodeUrl) {
      throw Error('ETH1 node is required');
    }
    const validOperatorIds = Array.isArray(scannerParams.operatorIds) && this.isValidOperatorIds(scannerParams.operatorIds.length);
    if (!validOperatorIds) {
      throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
    }
    if (!scannerParams.ownerAddress) {
      throw Error('Cluster owner address is required');
    }
    if (scannerParams.contractAddress.length !== 42) {
      throw Error('Invalid contract address length.');
    }
    if (!scannerParams.contractAddress.startsWith('0x')) {
      throw Error('Invalid contract address.');
    }
    if (scannerParams.ownerAddress.length !== 42) {
      throw Error('Invalid owner address length.');
    }
    if (!scannerParams.ownerAddress.startsWith('0x')) {
      throw Error('Invalid owner address.');
    }
    this.params = scannerParams;
    // convert to checksum addresses
    this.params.contractAddress = Web3Provider.web3().utils.toChecksumAddress(this.params.contractAddress);
    this.params.ownerAddress = Web3Provider.web3().utils.toChecksumAddress(this.params.ownerAddress);
    this.params.operatorIds = [...this.params.operatorIds].sort((a: number, b: number) => a - b);
  }

  async scan(): Promise<IData> {
    return this.getClusterSnapshot(false);
  }

  async execute(): Promise<IData> {
    console.log('\nScanning blockchain...');
    this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    const data: IData = await this.getClusterSnapshot(true);
    this.progressBar.stop();
    return data;
  }

  async getClusterSnapshot(cli: boolean): Promise<IData> {
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
      throw new Error('Could not find any cluster snapshot from the provided contract address.');
    }
    let step = this.MONTH;
    let clusterSnapshot;
    let biggestBlockNumber = 0;

    const ownerTopic = Web3Provider.web3().eth.abi.encodeParameter('address', this.params.ownerAddress);
    const filters = {
      fromBlock: latestBlockNumber - step,
      toBlock: latestBlockNumber,
      topics: [null, ownerTopic],
    };

    cli && this.progressBar.start(latestBlockNumber, 0);
    while (!clusterSnapshot && filters.fromBlock > 0) {
      let result: any;
      try {
        result = await Web3Provider.contract(this.params.nodeUrl, this.params.contractAddress).getPastEvents('allEvents', filters);
        result
          .filter((item: any) => this.eventsList.includes(item.event))
          .filter((item: any) => JSON.stringify(item.returnValues.operatorIds.map((value: any) => +value)) === JSON.stringify(this.params.operatorIds))
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

    clusterSnapshot = clusterSnapshot || ['0', '0', '0', '0', true];
    return {
      payload: {
        'Owner': this.params.ownerAddress,
        'Operators': this.params.operatorIds.sort((a: number, b: number) => a - b).join(','),
        'Block': biggestBlockNumber || latestBlockNumber,
        'Data': clusterSnapshot.join(','),
      },
      cluster: {
        validatorCount: clusterSnapshot[0],
        networkFeeIndex: clusterSnapshot[1],
        index: clusterSnapshot[2],
        balance: clusterSnapshot[3],
        active: clusterSnapshot[4],
      }
    };
  }

  private isValidOperatorIds(operatorsLength: number) {
    return (operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1) ? false : true;
  }
}
