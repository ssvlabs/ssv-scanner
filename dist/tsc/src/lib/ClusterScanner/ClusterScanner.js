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
    async run(operatorIds, cli) {
        const validOperatorIds = Array.isArray(operatorIds) && this._isValidOperatorIds(operatorIds.length);
        if (!validOperatorIds) {
            throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
        }
        operatorIds = [...operatorIds].sort((a, b) => a - b);
        if (cli) {
            console.log('\nScanning blockchain...');
            this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
        }
        const data = await this._getClusterSnapshot(operatorIds, cli);
        cli && this.progressBar.stop();
        return data;
    }
    async _getClusterSnapshot(operatorIds, cli) {
        let latestBlockNumber;
        const contractProvider = new contract_provider_1.ContractProvider(this.params.network, this.params.nodeUrl);
        try {
            latestBlockNumber = await contractProvider.web3.eth.getBlockNumber();
        }
        catch (err) {
            throw new Error('Could not access the provided node endpoint: ' + err);
        }
        try {
            await contractProvider.contractCore.methods.owner().call();
            // HERE we can validate the contract owner address
        }
        catch (err) {
            throw new Error('Could not find any cluster snapshot from the provided contract address: ' + err);
        }
        let step = this.MONTH;
        let clusterSnapshot;
        let biggestBlockNumber = 0;
        let transactionIndex = 0;
        const genesisBlock = contractProvider.genesisBlock;
        const ownerTopic = contractProvider.web3.eth.abi.encodeParameter('address', this.params.ownerAddress);
        const filters = {
            fromBlock: Math.max(Number(latestBlockNumber) - step, genesisBlock),
            toBlock: Number(latestBlockNumber),
            topics: [null, ownerTopic],
        };
        cli && this.progressBar.start(Number(latestBlockNumber), 0);
        while (!clusterSnapshot && filters.fromBlock >= genesisBlock) {
            let result;
            try {
                result = await contractProvider.contractCore.getPastEvents('allEvents', filters);
                result
                    .filter((item) => this.eventsList.includes(item.event))
                    .filter((item) => JSON.stringify(item.returnValues.operatorIds.map((value) => Number(value))) === JSON.stringify(operatorIds))
                    .sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber)) // Sort by blockNumber in ascending order
                    .forEach((item) => {
                    if (item.blockNumber >= biggestBlockNumber) {
                        const previousBlockNumber = biggestBlockNumber;
                        biggestBlockNumber = Number(item.blockNumber);
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
            cli && this.progressBar.update(Number(latestBlockNumber) - (filters.toBlock - step));
        }
        cli && this.progressBar.update(Number(latestBlockNumber), Number(latestBlockNumber));
        const clusterSnapshotPrint = clusterSnapshot ? [
            clusterSnapshot.validatorCount,
            clusterSnapshot.networkFeeIndex,
            clusterSnapshot.index,
            clusterSnapshot.active,
            clusterSnapshot.balance
        ] : ['0', '0', '0', true, '0'];
        return {
            payload: {
                'Owner': this.params.ownerAddress,
                'Operators': operatorIds.sort((a, b) => a - b).join(','),
                'Block': biggestBlockNumber || Number(latestBlockNumber),
                'Data': clusterSnapshotPrint.join(',')
            },
            cluster: {
                validatorCount: clusterSnapshotPrint[0],
                networkFeeIndex: clusterSnapshotPrint[1],
                index: clusterSnapshotPrint[2],
                active: clusterSnapshotPrint[3],
                balance: clusterSnapshotPrint[4]
            }
        };
    }
    _isValidOperatorIds(operatorsLength) {
        return (!(operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1));
    }
}
exports.ClusterScanner = ClusterScanner;
//# sourceMappingURL=ClusterScanner.js.map