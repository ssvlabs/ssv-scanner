import { AbiCoder, ethers } from 'ethers';
import cliProgress from 'cli-progress';
import { getContractSettings } from '../contract.provider';

import { BaseScanner } from '../BaseScanner';

const fs = require('fs');
const path = require('path');

export class OperatorScanner extends BaseScanner {
  async run(outputPath?: string, isCli?: boolean): Promise<string> {
    if (isCli) {
      console.log('\nScanning blockchain...');
      this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    }
    try {
      const data = await this._getOperatorPubkeys(outputPath, isCli);
      isCli && this.progressBar.stop();
      return data;
    } catch (e: any) {
      isCli && this.progressBar.stop();
      throw new Error(e);
    }
  }

  async _getOperatorPubkeys(outputPath?: string, isCli?: boolean): Promise<string> {
    const { contractAddress, abi, genesisBlock } = getContractSettings(this.params.network)
    const provider = new ethers.JsonRpcProvider(this.params.nodeUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const iface = new ethers.Interface(abi);

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

    let blockStep = this.MONTH;

    isCli && this.progressBar.start(Number(latestBlockNumber), 0);
    const filter = contract.filters.OperatorAdded();
    let logs: any[] = [];

    for (let startBlock = genesisBlock; startBlock <= latestBlockNumber; startBlock += blockStep) {
      try {
        const endBlock = Math.min(startBlock + blockStep - 1, latestBlockNumber);
        const newLogs = await contract.queryFilter(filter, startBlock, endBlock);
        logs = [...logs, ...newLogs];
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

    // Create output path
    const dirPath = outputPath ? outputPath : path.join(__dirname, '../../data');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Define index before the loop
    let index = 0;
    
    // Initialize entries array outside the loop
    let entries = new Array(logs.length);
    
    // Clear existing file content if it exists
    const filePath = path.join(dirPath, `operator-pubkeys-${this.params.network}.json`);
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }

    // Loop through logs to extract the pubkey
    for (const log of logs) {
      const parsedLog = iface.parseLog(log);
      const decodedLog = iface.decodeEventLog('OperatorAdded', log.data);
      if (parsedLog === undefined || parsedLog === null) {
        throw new Error('Could not parse the log');
      }
        
      let result = '';

      try {
        const abiCode = AbiCoder.defaultAbiCoder();
        // Decode the pubkey using the ABI
        result = abiCode.decode(['string'], decodedLog[2]).join('')
      }
      catch (error: any) {
        // If decoding fails, use the raw value
        result = decodedLog[2];
      }

        // Add new entry with correct index
        entries[index] = {
          id: index + 1,
          pubkey: result
        };
        index++;
      }
      // Write to file once after the loop
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
      
      isCli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
      return dirPath;
    }
}


