
import cliProgress from 'cli-progress';
import { ContractProvider, ContractVersion } from '../contract.provider';

import { BaseScanner } from '../BaseScanner';

export class NonceScanner extends BaseScanner {
  protected eventsList = [
    'ValidatorAdded',
  ];

  async run(cli?: boolean): Promise<number> {
    if (cli) {
      console.log('\nScanning blockchain...');
      this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);  
    }
    try {
      const data = await this._getLatestNonce(cli);
      cli && this.progressBar.stop();
      return data;
    } catch (e: any) {
      cli && this.progressBar.stop();
      throw new Error(e);
    }
  }

  private async _getLatestNonce(cli?: boolean): Promise<number> {
    const [networkEnv, networkGroup] = ContractVersion[this.params.ssvNetwork.toUpperCase() as keyof typeof ContractVersion].split(':');
    const contractProvider = new ContractProvider(networkEnv, networkGroup, this.params.nodeUrl);

    let latestBlockNumber;
    try {
      latestBlockNumber = await contractProvider.web3.eth.getBlockNumber();
    } catch (err) {
      throw new Error('Could not access the provided node endpoint.');
    }
    try {
      await contractProvider.contractCore.methods.owner().call();
    } catch (err) {
      throw new Error('Could not find any cluster snapshot from the provided contract address.');
    }
    let step = this.MONTH;
    let latestNonce = 0;

    const genesisBlock = contractProvider.genesisBlock;
    const ownerTopic = contractProvider.web3.eth.abi.encodeParameter('address', this.params.ownerAddress);
    const filters = {
      fromBlock: genesisBlock,
      toBlock: latestBlockNumber,
      topics: [null, ownerTopic],
    };

    cli && this.progressBar.start(latestBlockNumber, 0);
    do {
      let result: any;
      try {
        result = 
          (await contractProvider.contractCore.getPastEvents('AllEvents', filters))
          .filter((item: any) => this.eventsList.includes(item.event));
        latestNonce += result.length;
        filters.fromBlock = filters.toBlock + 1;
      } catch (e: any) {
        if (step === this.MONTH) {
          step = this.WEEK;
        } else if (step === this.WEEK) {
          step = this.DAY;
        } else {
          throw new Error(e);
        }
      }
      filters.toBlock = Math.min(filters.fromBlock + step, latestBlockNumber);
      cli && this.progressBar.update(filters.toBlock);
    } while (filters.toBlock - filters.fromBlock > 0);

    cli && this.progressBar.update(latestBlockNumber, latestBlockNumber);

    return latestNonce;
  }
}
