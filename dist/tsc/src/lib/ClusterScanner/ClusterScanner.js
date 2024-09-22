"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterScanner = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const contract_provider_1 = require("../contract.provider");
const BaseScanner_1 = require("../BaseScanner");
class ClusterScanner extends BaseScanner_1.BaseScanner {
    async run(operatorIds, isCli) {
        const validOperatorIds = Array.isArray(operatorIds) && this._isValidOperatorIds(operatorIds.length);
        if (!validOperatorIds) {
            throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
        }
        operatorIds = [...operatorIds].sort((a, b) => a - b);
        if (isCli) {
            console.log('\nScanning blockchain...');
            this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
        }
        const data = await this._getClusterSnapshot(operatorIds, isCli);
        isCli && this.progressBar.stop();
        return data;
    }
    async _getClusterSnapshot(operatorIds, isCli) {
        const { contractAddress, abi, genesisBlock } = (0, contract_provider_1.getContractSettings)(this.params.network);
        let latestBlockNumber;
        const provider = new ethers_1.ethers.JsonRpcProvider(this.params.nodeUrl);
        try {
            latestBlockNumber = await provider.getBlockNumber();
        }
        catch (err) {
            throw new Error('Could not access the provided node endpoint: ' + err);
        }
        const contract = new ethers_1.ethers.Contract(contractAddress, abi, provider);
        try {
            await contract.owner();
        }
        catch (err) {
            throw new Error('Could not find any cluster snapshot from the provided contract address: ' + err);
        }
        let step = this.MONTH;
        let clusterSnapshot;
        let biggestBlockNumber = 0;
        let transactionIndex = 0;
        const eventsList = ['ClusterDeposited', 'ClusterWithdrawn', 'ValidatorRemoved', 'ValidatorAdded', 'ClusterLiquidated', 'ClusterWithdrawn'];
        isCli && this.progressBar.start(latestBlockNumber, 0);
        const operatorIdsAsString = JSON.stringify(operatorIds);
        for (let startBlock = latestBlockNumber; startBlock > genesisBlock && !clusterSnapshot; startBlock -= step) {
            const endBlock = Math.max(startBlock - step + 1, genesisBlock);
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
                    .filter((parsedLog) => JSON.stringify((parsedLog.event?.args.operatorIds.map((bigIntOpId) => Number(bigIntOpId)))) === operatorIdsAsString && parsedLog.event?.args.some((value) => ethers_1.ethers.isAddress(value) && ethers_1.ethers.getAddress(value) === this.params.ownerAddress))
                    .sort((a, b) => a.blockNumber - b.blockNumber)
                    .forEach((parsedLog) => {
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
            }
            catch (e) {
                console.error(e);
                if (step === this.MONTH) {
                    step = this.WEEK;
                }
                else if (step === this.WEEK) {
                    step = this.DAY;
                }
            }
            isCli && this.progressBar.update(startBlock);
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
                validatorCount: clusterSnapshot[0],
                networkFeeIndex: clusterSnapshot[1].toString(),
                index: clusterSnapshot[2].toString(),
                active: clusterSnapshot[3],
                balance: clusterSnapshot[4].toString()
            }
        };
    }
    _isValidOperatorIds(operatorsLength) {
        return !(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1);
    }
}
exports.ClusterScanner = ClusterScanner;
//# sourceMappingURL=ClusterScanner.js.map