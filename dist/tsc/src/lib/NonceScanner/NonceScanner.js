"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceScanner = void 0;
const tslib_1 = require("tslib");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
const web3_provider_1 = tslib_1.__importDefault(require("../web3.provider"));
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
            let latestBlockNumber;
            try {
                latestBlockNumber = yield web3_provider_1.default.web3(this.params.nodeUrl).eth.getBlockNumber();
            }
            catch (err) {
                throw new Error('Could not access the provided node endpoint.');
            }
            try {
                yield web3_provider_1.default.contract(this.params.nodeUrl, this.params.contractAddress).methods.owner().call();
            }
            catch (err) {
                throw new Error('Could not find any cluster snapshot from the provided contract address.');
            }
            let step = this.MONTH;
            let latestNonce = 0;
            const genesisBlock = yield web3_provider_1.default.getGenesisBlock(this.params.nodeUrl, this.params.contractAddress);
            const ownerTopic = web3_provider_1.default.web3().eth.abi.encodeParameter('address', this.params.ownerAddress);
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
                        (yield web3_provider_1.default.contract(this.params.nodeUrl, this.params.contractAddress).getPastEvents('AllEvents', filters))
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