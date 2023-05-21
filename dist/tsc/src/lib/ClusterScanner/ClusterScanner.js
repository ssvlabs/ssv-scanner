"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterScanner = void 0;
const tslib_1 = require("tslib");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const web3_provider_1 = tslib_1.__importDefault(require("../web3.provider"));
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
            try {
                latestBlockNumber = yield web3_provider_1.default.web3(this.params.nodeUrl).eth.getBlockNumber();
            }
            catch (err) {
                throw new Error('Could not access the provided node endpoint.');
            }
            try {
                yield web3_provider_1.default.contract(this.params.nodeUrl, this.params.contractAddress).methods.owner().call();
                // HERE we can validate the contract owner address
            }
            catch (err) {
                console.log("eee", err);
                throw new Error('Could not find any cluster snapshot from the provided contract address.');
            }
            let step = this.MONTH;
            let clusterSnapshot;
            let biggestBlockNumber = 0;
            const ownerTopic = web3_provider_1.default.web3().eth.abi.encodeParameter('address', this.params.ownerAddress);
            const filters = {
                fromBlock: latestBlockNumber - step,
                toBlock: latestBlockNumber,
                topics: [null, ownerTopic],
            };
            cli && this.progressBar.start(latestBlockNumber, 0);
            while (!clusterSnapshot && filters.fromBlock > 0) {
                let result;
                try {
                    result = yield web3_provider_1.default.contract(this.params.nodeUrl, this.params.contractAddress).getPastEvents('allEvents', filters);
                    result
                        .filter((item) => this.eventsList.includes(item.event))
                        .filter((item) => JSON.stringify(item.returnValues.operatorIds.map((value) => +value)) === JSON.stringify(operatorIds))
                        .forEach((item) => {
                        if (item.blockNumber > biggestBlockNumber) {
                            biggestBlockNumber = item.blockNumber;
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
            clusterSnapshot = clusterSnapshot || ['0', '0', '0', '0', true];
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
                    balance: clusterSnapshot[3],
                    active: clusterSnapshot[4],
                }
            };
        });
    }
    _isValidOperatorIds(operatorsLength) {
        return (operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1) ? false : true;
    }
}
exports.ClusterScanner = ClusterScanner;
//# sourceMappingURL=ClusterScanner.js.map