import Web3 from 'web3';
export type NetworkName = string;
export type ContractAddress = string;
export type ContractData = {
    version: string;
    network: string;
    address: ContractAddress;
    addressViews: ContractAddress;
    tokenAddress: string;
    abi: Record<string, any>;
    abiViews: Record<string, any>;
    genesisBlock: number;
};
export declare const ContractVersion: {
    readonly MAINNET: "prod:v4.mainnet";
    readonly PRATER: "prod:v4.prater";
    readonly PRATER_STAGE: "stage:v4.prater";
};
export declare class ContractProvider {
    private contract;
    web3: Web3;
    constructor(contractEnv: string, contractGroup: string, nodeUrl: string);
    get abiCore(): any;
    get abiViews(): any;
    get contractCore(): import("web3-eth-contract").Contract;
    get contractViews(): import("web3-eth-contract").Contract;
    get genesisBlock(): number;
}
