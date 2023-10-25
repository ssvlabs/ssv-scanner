"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractProvider = exports.ContractVersion = void 0;
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
exports.ContractVersion = {
    MAINNET: 'prod:v4.mainnet',
    PRATER: 'prod:v4.prater',
    HOLESKY: 'prod:v4.holesky',
    PRATER_STAGE: 'stage:v4.prater',
    HOLESKY_STAGE: 'stage:v4.holesky',
};
class ContractProvider {
    constructor(contractEnv, contractGroup, nodeUrl) {
        let [version, network] = contractGroup.split('.');
        version = version.toUpperCase();
        network = network.toUpperCase();
        let jsonCoreData;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            jsonCoreData = require(`../shared/abi/${contractEnv}.${contractGroup}.abi.json`);
        }
        catch (err) {
            console.error(`Failed to load JSON data from ${contractEnv}.${contractGroup}.abi.json`, err);
            throw err;
        }
        let jsonViewsData;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            jsonViewsData = require(`../shared/abi/${contractEnv}.${contractGroup}.views.abi.json`);
        }
        catch (err) {
            console.error(`Failed to load JSON data from ${contractEnv}.${contractGroup}.views.abi.json`, err);
            throw err;
        }
        // Check if required properties exist in jsonData
        if (!jsonCoreData.contractAddress ||
            !jsonCoreData.abi ||
            !jsonCoreData.genesisBlock) {
            throw new Error(`Missing core data in JSON for ${contractEnv}.${contractGroup}`);
        }
        // Check if required properties exist in jsonData
        if (!jsonViewsData.contractAddress || !jsonViewsData.abi) {
            throw new Error(`Missing views data in JSON for ${contractEnv}.${contractGroup}`);
        }
        this.contract = {
            version,
            network,
            address: jsonCoreData.contractAddress,
            addressViews: jsonViewsData.contractAddress,
            abi: jsonCoreData.abi,
            abiViews: jsonViewsData.abi,
            genesisBlock: jsonCoreData.genesisBlock,
        };
        this.web3 = new web3_1.default(nodeUrl);
    }
    get abiCore() {
        return this.contract.abi;
    }
    get abiViews() {
        return this.contract.abiViews;
    }
    get contractCore() {
        return new this.web3.eth.Contract(this.abiCore, this.contract.address);
    }
    get contractViews() {
        return new this.web3.eth.Contract(this.abiViews, this.contract.addressViews);
    }
    get genesisBlock() {
        return this.contract.genesisBlock;
    }
}
exports.ContractProvider = ContractProvider;
//# sourceMappingURL=contract.provider.js.map