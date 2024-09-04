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
    async run(cli) {
        if (cli) {
            console.log('\nScanning blockchain...');
            this.progressBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
        }
        try {
            const data = await this._getLatestNonce(cli);
            cli && this.progressBar.stop();
            return data;
        }
        catch (e) {
            cli && this.progressBar.stop();
            throw new Error(e);
        }
    }
    async _getLatestNonce(cli) {
        const contractProvider = new contract_provider_1.ContractProvider(this.params.network, this.params.nodeUrl);
        let latestBlockNumber;
        try {
            latestBlockNumber = await contractProvider.web3.eth.getBlockNumber();
        }
        catch (err) {
            throw new Error('Could not access the provided node endpoint.');
        }
        try {
            await contractProvider.contractCore.methods.owner().call();
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
            toBlock: Number(latestBlockNumber),
            topics: [null, ownerTopic],
        };
        cli && this.progressBar.start(Number(latestBlockNumber), 0);
        do {
            let result;
            try {
                result =
                    (await contractProvider.contractCore.getPastEvents('allEvents', filters))
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
            filters.toBlock = Math.min(filters.fromBlock + step, Number(latestBlockNumber));
            cli && this.progressBar.update(filters.toBlock);
        } while (filters.toBlock - filters.fromBlock > 0);
        cli && this.progressBar.update(Number(latestBlockNumber), Number(latestBlockNumber));
        return latestNonce;
    }
}
exports.NonceScanner = NonceScanner;
//# sourceMappingURL=NonceScanner.js.map