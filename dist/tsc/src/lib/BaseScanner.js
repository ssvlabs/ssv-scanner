"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScanner = void 0;
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
class BaseScanner {
    constructor(scannerParams) {
        this.DAY = 5400;
        this.WEEK = this.DAY * 7;
        this.MONTH = this.DAY * 30;
        if (!scannerParams.nodeUrl) {
            throw Error('ETH1 node is required');
        }
        if (!scannerParams.ssvNetwork) {
            throw Error('Network is required');
        }
        if (!scannerParams.ownerAddress) {
            throw Error('Cluster owner address is required');
        }
        if (scannerParams.ownerAddress.length !== 42) {
            throw Error('Invalid owner address length.');
        }
        if (!scannerParams.ownerAddress.startsWith('0x')) {
            throw Error('Invalid owner address.');
        }
        this.params = scannerParams;
        // convert to checksum addresses
        this.params.contractAddress = new web3_1.default().utils.toChecksumAddress(this.params.contractAddress);
        this.params.ownerAddress = new web3_1.default().utils.toChecksumAddress(this.params.ownerAddress);
    }
}
exports.BaseScanner = BaseScanner;
//# sourceMappingURL=BaseScanner.js.map