
import cliProgress from 'cli-progress';
import Web3Provider from '../web3.provider';

import { BaseScanner } from '../BaseScanner';

export class NonceScanner extends BaseScanner {
  async run(cli?: boolean): Promise<number> {
    if (cli) {
      console.log('\nScanning blockchain...');
      this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);  
    }
    const data = await this._getLatestNonce(cli);
    cli && this.progressBar.stop();
    return data;
  }

  private async _getLatestNonce(cli?: boolean): Promise<number> {
    let latestBlockNumber;
    try {
      latestBlockNumber = await Web3Provider.web3(this.params.nodeUrl).eth.getBlockNumber();
    } catch (err) {
      throw new Error('Could not access the provided node endpoint.');
    }
    try {
      await Web3Provider.contract(this.params.nodeUrl, this.params.contractAddress).methods.owner().call();
    } catch (err) {
      throw new Error('Could not find any cluster snapshot from the provided contract address.');
    }
    let step = this.MONTH;
    let latestNonce = 0;

    const genesisBlock = await Web3Provider.getGenesisBlock(this.params.nodeUrl, this.params.contractAddress);
    const ownerTopic = Web3Provider.web3().eth.abi.encodeParameter('address', this.params.ownerAddress);
    const filters = {
      fromBlock: genesisBlock,
      toBlock: latestBlockNumber,
      topics: [null, ownerTopic],
    };

    cli && this.progressBar.start(latestBlockNumber, 0);
    do {
      let result: any;
      try {
        result = await Web3Provider.contract(this.params.nodeUrl, this.params.contractAddress).getPastEvents('ValidatorAdded', filters);
        latestNonce += result.length;
        filters.fromBlock = filters.toBlock + 1;
      } catch (e) {
        console.error(e);
        if (step === this.MONTH) {
          step = this.WEEK;
        } else if (step === this.WEEK) {
          step = this.DAY;
        }
      }
      filters.toBlock = filters.fromBlock + step < latestBlockNumber ? filters.fromBlock + step : latestBlockNumber;
      cli && this.progressBar.update(filters.toBlock);
    } while (filters.toBlock - filters.fromBlock > 0);

    cli && this.progressBar.update(latestBlockNumber, latestBlockNumber);

    return latestNonce;
  }
}
