"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorScanner = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const contract_provider_1 = require("../contract.provider");
const BaseScanner_1 = require("../BaseScanner");
const fs = require('fs');
const path = require('path');
class OperatorScanner extends BaseScanner_1.BaseScanner {
    async run(outputPath, isCli) {
        if (isCli) {
            console.log('\nScanning blockchain...');
            this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
        }
        try {
            const data = await this._getOperatorPubkeys(outputPath, isCli);
            isCli && this.progressBar.stop();
            return data;
        }
        catch (e) {
            isCli && this.progressBar.stop();
            throw new Error(e);
        }
    }
    async _getOperatorPubkeys(outputPath, isCli) {
        const { contractAddress, abi, genesisBlock } = (0, contract_provider_1.getContractSettings)(this.params.network);
        const provider = new ethers_1.ethers.JsonRpcProvider(this.params.nodeUrl);
        const contract = new ethers_1.ethers.Contract(contractAddress, abi, provider);
        const iface = new ethers_1.ethers.Interface(abi);
        let latestBlockNumber;
        try {
            latestBlockNumber = await provider.getBlockNumber();
        }
        catch (err) {
            throw new Error('Could not access the provided node endpoint.');
        }
        try {
            await contract.owner();
        }
        catch (err) {
            throw new Error('Could not find any cluster snapshot from the provided contract address.');
        }
        let blockStep = this.MONTH;
        isCli && this.progressBar.start(Number(latestBlockNumber), 0);
        const filter = contract.filters.OperatorAdded();
        let logs = [];
        for (let startBlock = genesisBlock; startBlock <= latestBlockNumber; startBlock += blockStep) {
            try {
                const endBlock = Math.min(startBlock + blockStep - 1, latestBlockNumber);
                const newLogs = await contract.queryFilter(filter, startBlock, endBlock);
                logs = [...logs, ...newLogs];
                isCli && this.progressBar.update(endBlock);
            }
            catch (error) {
                if (blockStep === this.MONTH) {
                    blockStep = this.WEEK;
                }
                else if (blockStep === this.WEEK) {
                    blockStep = this.DAY;
                }
                else {
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
        const filePath = path.join(dirPath, 'operator-pubkeys.json');
        if (fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
        }
        for (const log of logs) {
            const parsedLog = iface.parseLog(log);
            const decodedLog = iface.decodeEventLog('OperatorAdded', log.data);
            if (parsedLog === undefined || parsedLog === null) {
                throw new Error('Could not parse the log');
            }
            let result = '';
            try {
                const abiCode = ethers_1.AbiCoder.defaultAbiCoder();
                result = abiCode.decode(['string'], decodedLog[2]).join('');
            }
            catch (error) {
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
exports.OperatorScanner = OperatorScanner;
//# sourceMappingURL=OperatorScanner.js.map