"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterScanner = void 0;
const tslib_1 = require("tslib");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const contract_provider_1 = require("../contract.provider");
const BaseScanner_1 = require("../BaseScanner");
class ClusterScanner extends BaseScanner_1.BaseScanner {
    constructor() {
        super(...arguments);
        this.eventsList = [
            'ClusterDeposited',
            'ClusterWithdrawn',
            'ValidatorRemoved',
            'ValidatorAdded',
            'ClusterLiquidated',
            'ClusterReactivated',
        ];
    }
    run(operatorIds, cli) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const validOperatorIds = Array.isArray(operatorIds) && this._isValidOperatorIds(operatorIds.length);
            if (!validOperatorIds) {
                throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
            }
            operatorIds = [...operatorIds].sort((a, b) => a - b);
            if (cli) {
                console.log('\nScanning blockchain...');
                this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
            }
            const data = yield this._getClusterSnapshot(operatorIds, cli);
            cli && this.progressBar.stop();
            return data;
        });
    }
    _getClusterSnapshot(operatorIds, cli) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let latestBlockNumber;
            const contractProvider = new contract_provider_1.ContractProvider(this.params.network, this.params.nodeUrl);
            try {
                latestBlockNumber = yield contractProvider.web3.eth.getBlockNumber();
            }
            catch (err) {
                throw new Error('Could not access the provided node endpoint: ' + err);
            }
            try {
                yield contractProvider.contractCore.methods.owner().call();
                // HERE we can validate the contract owner address
            }
            catch (err) {
                throw new Error('Could not find any cluster snapshot from the provided contract address: ' + err);
            }
            let step = this.MONTH;
            let clusterSnapshot;
            let biggestBlockNumber = 0;
            let transactionIndex = 0;

            // Seems that contractProvider is getting incorrect genesis block as some clusters it works with and other not 
            // I did find pattern that clusters i worked with more recently work and clusters i didnt work with in a long time did not (which gave me idea that genesis block was incorrect)
            const genesisBlock = 84599 // <- this is dirty fix to solve stage, this call to get var "contractProvider" needs to be looked into

            const ownerTopic = contractProvider.web3.eth.abi.encodeParameter('address', this.params.ownerAddress);
            const filters = {
                fromBlock: Math.max(latestBlockNumber - step, genesisBlock),
                toBlock: latestBlockNumber,
                topics: [null, ownerTopic],
            };
            cli && this.progressBar.start(latestBlockNumber, 0);
            while (!clusterSnapshot && filters.fromBlock >= genesisBlock) {
                let result;
                try {
                    result = yield contractProvider.contractCore.getPastEvents('allEvents', filters);
                    result
                        .filter((item) => this.eventsList.includes(item.event))
                        .filter((item) => JSON.stringify(item.returnValues.operatorIds.map((value) => +value)) === JSON.stringify(operatorIds))
                        .sort((a, b) => a.blockNumber - b.blockNumber) // Sort by blockNumber in ascending order
                        .forEach((item) => {
                        if (item.blockNumber >= biggestBlockNumber) {
                            const previousBlockNumber = biggestBlockNumber;
                            biggestBlockNumber = item.blockNumber;
                            // same block number case to compare transactionIndex in block
                            if (previousBlockNumber === item.blockNumber && item.transactionIndex < transactionIndex) {
                                return;
                            }
                            transactionIndex = item.transactionIndex; // to use only for the case multiple events in one block number
                            clusterSnapshot = item.returnValues.cluster;
                        }
                    });
                    filters.toBlock = filters.fromBlock;
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
                filters.fromBlock = filters.toBlock - step;
                cli && this.progressBar.update(latestBlockNumber - (filters.toBlock - step));
            }
            cli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
            clusterSnapshot = clusterSnapshot || ['0', '0', '0', true, '0'];
            return {
                payload: {
                    'Owner': this.params.ownerAddress,
                    'Operators': operatorIds.sort((a, b) => a - b).join(','),
                    'Block': biggestBlockNumber || latestBlockNumber,
                    'Data': clusterSnapshot.join(','),
                },
                cluster: {
                    validatorCount: clusterSnapshot[0],
                    networkFeeIndex: clusterSnapshot[1],
                    index: clusterSnapshot[2],
                    active: clusterSnapshot[3],
                    balance: clusterSnapshot[4],
                }
            };
        });
    }
    _isValidOperatorIds(operatorsLength) {
        return (!(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1));
    }
}
exports.ClusterScanner = ClusterScanner;
//# sourceMappingURL=ClusterScanner.js.map
