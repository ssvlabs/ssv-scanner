"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSVScannerCommand = void 0;
const tslib_1 = require("tslib");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const web3_provider_1 = tslib_1.__importDefault(require("../lib/web3.provider"));
class SSVScannerCommand {
    constructor(scannerParams) {
        this.DAY = 5400;
        this.WEEK = this.DAY * 7;
        this.MONTH = this.DAY * 30;
        this.eventsList = [
            'ClusterDeposited',
            'ClusterWithdrawn',
            'ValidatorRemoved',
            'ValidatorAdded',
            'ClusterLiquidated',
            'ClusterReactivated',
        ];
        if (!scannerParams.contractAddress) {
            throw Error('Contract address is required');
        }
        if (!scannerParams.nodeUrl) {
            throw Error('ETH1 node is required');
        }
        const validOperatorIds = Array.isArray(scannerParams.operatorIds) && this.isValidOperatorIds(scannerParams.operatorIds.length);
        if (!validOperatorIds) {
            throw Error('Comma-separated list of operator IDs. The amount must be 3f+1 compatible.');
        }
        if (!scannerParams.ownerAddress) {
            throw Error('Cluster owner address is required');
        }
        if (scannerParams.contractAddress.length !== 42) {
            throw Error('Invalid contract address length.');
        }
        if (!scannerParams.contractAddress.startsWith('0x')) {
            throw Error('Invalid contract address.');
        }
        if (scannerParams.ownerAddress.length !== 42) {
            throw Error('Invalid owner address length.');
        }
        if (!scannerParams.ownerAddress.startsWith('0x')) {
            throw Error('Invalid owner address.');
        }
        this.params = scannerParams;
        // convert to checksum addresses
        this.params.contractAddress = web3_provider_1.default.web3().utils.toChecksumAddress(this.params.contractAddress);
        this.params.ownerAddress = web3_provider_1.default.web3().utils.toChecksumAddress(this.params.ownerAddress);
        this.params.operatorIds = [...this.params.operatorIds].sort((a, b) => a - b);
    }
    scan() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.getClusterSnapshot(false);
        });
    }
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('\nScanning blockchain...');
            this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
            const data = yield this.getClusterSnapshot(true);
            this.progressBar.stop();
            return data;
        });
    }
    getClusterSnapshot(cli) {
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
                        .filter((item) => JSON.stringify(item.returnValues.operatorIds.map((value) => +value)) === JSON.stringify(this.params.operatorIds))
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
                    'Operators': this.params.operatorIds.sort((a, b) => a - b).join(','),
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
    isValidOperatorIds(operatorsLength) {
        return (operatorsLength < 4 || operatorsLength > 13 || operatorsLength % 3 != 1) ? false : true;
    }
}
exports.SSVScannerCommand = SSVScannerCommand;
//# sourceMappingURL=SSVScannerCommand.js.map