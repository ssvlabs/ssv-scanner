"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScanner = void 0;
const tslib_1 = require("tslib");
const web3_provider_1 = tslib_1.__importDefault(require("./web3.provider"));
class BaseScanner {
    constructor(scannerParams) {
        this.DAY = 5400;
        this.WEEK = this.DAY * 7;
        this.MONTH = this.DAY * 30;
        if (!scannerParams.contractAddress) {
            throw Error('Contract address is required');
        }
        if (!scannerParams.nodeUrl) {
            throw Error('ETH1 node is required');
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
    }
}
exports.BaseScanner = BaseScanner;
//# sourceMappingURL=BaseScanner.js.map