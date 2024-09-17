"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScanner = void 0;
const ethers_1 = require("ethers");
class BaseScanner {
    constructor(scannerParams) {
        this.DAY = 5400;
        this.WEEK = this.DAY * 7;
        this.MONTH = this.DAY * 30;
        if (!scannerParams.nodeUrl) {
            throw Error('ETH1 node is required');
        }
        if (!scannerParams.network) {
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
        this.params.ownerAddress = ethers_1.ethers.getAddress(this.params.ownerAddress);
    }
}
exports.BaseScanner = BaseScanner;
//# sourceMappingURL=BaseScanner.js.map