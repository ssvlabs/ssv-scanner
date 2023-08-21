"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceScanner = void 0;
const tslib_1 = require("tslib");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const contract_provider_1 = require("../contract.provider");
const BaseScanner_1 = require("../BaseScanner");
class NonceScanner extends BaseScanner_1.BaseScanner {
    constructor() {
        super(...arguments);
        this.eventsList = [
            'ValidatorAdded',
        ];
    }
    run(cli) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (cli) {
                console.log('\nScanning blockchain...');
                this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
            }
            try {
                const data = yield this._getLatestNonce(cli);
                cli && this.progressBar.stop();
                return data;
            }
            catch (e) {
                cli && this.progressBar.stop();
                throw new Error(e);
            }
        });
    }
    _getLatestNonce(cli) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const contractProvider = new contract_provider_1.ContractProvider(this.params.ssvSyncEnv, this.params.ssvSyncGroup, this.params.nodeUrl);
            let latestBlockNumber;
            try {
                latestBlockNumber = yield contractProvider.web3.eth.getBlockNumber();
            }
            catch (err) {
                throw new Error('Could not access the provided node endpoint.');
            }
            try {
                yield contractProvider.contractCore.methods.owner().call();
            }
            catch (err) {
                throw new Error('Could not find any cluster snapshot from the provided contract address.');
            }
            let step = this.MONTH;
            let latestNonce = 0;
            const genesisBlock = contractProvider.genesisBlock;
            const ownerTopic = contractProvider.web3.eth.abi.encodeParameter('address', this.params.ownerAddress);
            const filters = {
                fromBlock: genesisBlock,
                toBlock: latestBlockNumber,
                topics: [null, ownerTopic],
            };
            cli && this.progressBar.start(latestBlockNumber, 0);
            do {
                let result;
                try {
                    result =
                        (yield contractProvider.contractCore.getPastEvents('AllEvents', filters))
                            .filter((item) => this.eventsList.includes(item.event));
                    latestNonce += result.length;
                    filters.fromBlock = filters.toBlock + 1;
                }
                catch (e) {
                    if (step === this.MONTH) {
                        step = this.WEEK;
                    }
                    else if (step === this.WEEK) {
                        step = this.DAY;
                    }
                    else {
                        throw new Error(e);
                    }
                }
                filters.toBlock = Math.min(filters.fromBlock + step, latestBlockNumber);
                cli && this.progressBar.update(filters.toBlock);
            } while (filters.toBlock - filters.fromBlock > 0);
            cli && this.progressBar.update(latestBlockNumber, latestBlockNumber);
            return latestNonce;
        });
    }
}
exports.NonceScanner = NonceScanner;
//# sourceMappingURL=NonceScanner.js.map