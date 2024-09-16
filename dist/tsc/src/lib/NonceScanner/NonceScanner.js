"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceScanner = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const contract_provider_1 = require("../contract.provider");
const BaseScanner_1 = require("../BaseScanner");
class NonceScanner extends BaseScanner_1.BaseScanner {
    async run(isCli) {
        if (isCli) {
            console.log('\nScanning blockchain...');
            this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
        }
        try {
            const data = await this._getValidatorAddedEventCount(isCli);
            isCli && this.progressBar.stop();
            return data;
        }
        catch (e) {
            isCli && this.progressBar.stop();
            throw new Error(e);
        }
    }
    async _getValidatorAddedEventCount(isCli) {
        const { contractAddress, abi, genesisBlock } = (0, contract_provider_1.getContractSettings)(this.params.network);
        const provider = new ethers_1.ethers.JsonRpcProvider(this.params.nodeUrl);
        const contract = new ethers_1.ethers.Contract(contractAddress, abi, provider);
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
        isCli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
        return totalEventCount;
    }
}
exports.NonceScanner = NonceScanner;
//# sourceMappingURL=NonceScanner.js.map