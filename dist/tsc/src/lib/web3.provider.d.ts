import Web3 from 'web3';
export default class Web3Provider {
    static BLOCK_RANGE_500K: number;
    static web3(nodeUrl?: string): Web3;
    static get abi(): any;
    static contract(nodeUrl: string, contractAddress: string): import("web3-eth-contract").Contract;
    static getGenesisBlock(nodeUrl: string, contractAddress: string): Promise<number>;
}
