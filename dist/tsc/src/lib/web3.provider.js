"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
const v3_abi_json_1 = tslib_1.__importDefault(require("../shared/v3.abi.json"));
class Web3Provider {
    static web3(nodeUrl = '') {
        return new web3_1.default(nodeUrl);
    }
    static get abi() {
        return v3_abi_json_1.default;
    }
    static contract(nodeUrl, contractAddress) {
        return new (Web3Provider.web3(nodeUrl)).eth.Contract(Web3Provider.abi, contractAddress);
    }
    static getGenesisBlock(nodeUrl, contractAddress) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [fistEvent] = yield Web3Provider.contract(nodeUrl, contractAddress).getPastEvents('Initialized', { fromBlock: 0 });
            return (fistEvent === null || fistEvent === void 0 ? void 0 : fistEvent.blockNumber) || 0;
        });
    }
}
exports.default = Web3Provider;
Web3Provider.BLOCK_RANGE_500K = 500000;
//# sourceMappingURL=web3.provider.js.map