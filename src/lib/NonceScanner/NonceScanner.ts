import { ethers } from 'ethers';
import cliProgress from 'cli-progress';
import { getContractSettings } from '../contract.provider';

import { BaseScanner } from '../BaseScanner';

export class NonceScanner extends BaseScanner {
  async run(isCli?: boolean): Promise<number> {
    if (isCli) {
      console.log('\nScanning blockchain...');
      this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    }
    try {
      const data = await this._getValidatorAddedEventCount(isCli);
      isCli && this.progressBar.stop();
      return data;
    } catch (e: any) {
      isCli && this.progressBar.stop();
      throw new Error(e);
    }
  }

  async _getValidatorAddedEventCount(isCli?: boolean): Promise<number> {
    const { contractAddress, abi, genesisBlock } = getContractSettings(this.params.network)
    const provider = new ethers.JsonRpcProvider(this.params.nodeUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    let latestBlockNumber;
    try {
      latestBlockNumber = await provider.getBlockNumber();
    } catch (err) {
      throw new Error('Could not access the provided node endpoint.');
    }

    try {
      await contract.owner();
    } catch (err) {
      throw new Error('Could not find any cluster snapshot from the provided contract address.');
    }

    let totalEventCount = 0;
    let blockStep = this.MONTH;

    isCli && this.progressBar.start(Number(latestBlockNumber), 0);
    const filter = contract.filters.ValidatorAdded(this.params.ownerAddress);

    for (let startBlock = genesisBlock; startBlock <= latestBlockNumber; startBlock += blockStep) {
      try {
        const endBlock = Math.min(startBlock + blockStep - 1, latestBlockNumber);
        const logs = await contract.queryFilter(filter, startBlock, endBlock);

        totalEventCount += logs.length;
        isCli && this.progressBar.update(endBlock);
      } catch (error: any) {
        if (blockStep === this.MONTH) {
          blockStep = this.WEEK;
        } else if (blockStep === this.WEEK) {
          blockStep = this.DAY;
        } else {
          throw new Error(error);
        }
      }
    }

    isCli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
    return totalEventCount;
  }
}
