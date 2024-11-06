"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterScanner = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const contract_provider_1 = require("../contract.provider");
const BaseScanner_1 = require("../BaseScanner");
// transactionHash: '0x6de9cf4ef292be3b9dc12c8b97772588eb0c7bdcbe1e16fbd1db342bb071c75a',
//   blockHash: '0xc4ce5279c035b0a99da0571f977af589b1d783651da3774708e892796ce840c0',
//   blockNumber: 2624456,
//   removed: false,
//   address: '0x0d33801785340072C452b994496B19f196b7eE15',
//   data: '0x000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002,
// topics: [
//   '0x48a3ea0796746043948f6341d17ff8200937b99262a0b48c2663b951ed7114e5',
//   '0x0000000000000000000000007934278428d237239addb0bab910b639ec758b98'
// ],
//   index: 130,
//   transactionIndex: 53
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
        const eventsList = ['ClusterDeposited', 'ClusterWithdrawn', 'ClusterReactivated', 'ValidatorRemoved', 'ValidatorAdded', 'ClusterLiquidated', 'ClusterWithdrawn'];
        isCli && this.progressBar.start(latestBlockNumber, genesisBlock);
        const operatorIdsAsString = JSON.stringify(operatorIds);
        let prevProgressBarState = genesisBlock;
        for (let startBlock = latestBlockNumber; startBlock > genesisBlock && !clusterSnapshot; startBlock -= step) {
            const endBlock = Math.max(startBlock - step + 1, genesisBlock);
            try {
                const filter = {
                    address: contractAddress,
                    fromBlock: endBlock,
                    toBlock: startBlock,
                    topics: [null, ethers_1.ethers.zeroPadValue(this.params.ownerAddress, 32)],
                };
                const logs = await provider.getLogs(filter);
                let res = logs
                    .map((log) => ({
                    event: contract.interface.parseLog(log),
                    blockNumber: log.blockNumber,
                    transactionIndex: log.transactionIndex,
                    logIndex: log.index
                }));
                res = res
                    .filter((parsedLog) => parsedLog.event && eventsList.includes(parsedLog.event.name))
                    .filter((parsedLog) => JSON.stringify((parsedLog.event?.args.operatorIds.map((bigIntOpId) => Number(bigIntOpId)))) === operatorIdsAsString)
                    .sort((a, b) => {
                    if (b.blockNumber === a.blockNumber) {
                        if (b.transactionIndex === a.transactionIndex) {
                            return b.logIndex - a.logIndex;
                        }
                        else {
                            return b.transactionIndex - a.transactionIndex;
                        }
                    }
                    else {
                        return b.blockNumber - a.blockNumber;
                    }
                });
                clusterSnapshot = res[0].event?.args.cluster;
            }
            catch (e) {
                if (step === this.MONTH) {
                    step = this.WEEK;
                    startBlock += this.WEEK;
                }
                else if (step === this.WEEK) {
                    step = this.DAY;
                    startBlock += this.DAY;
                }
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
    _isValidOperatorIds(operatorsLength) {
        return !(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1);
    }
}
exports.ClusterScanner = ClusterScanner;
//# sourceMappingURL=ClusterScanner.js.map