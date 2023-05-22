import Web3 from 'web3';
import ABI_V3 from '../shared/v3.abi.json';

export default class Web3Provider {
  static BLOCK_RANGE_500K = 500000;

  static web3(nodeUrl: string = '') {
    return new Web3(nodeUrl);
  }

  static get abi() {
    return ABI_V3 as any;
  }

  static contract(nodeUrl: string, contractAddress: string) {
    return new (Web3Provider.web3(nodeUrl)).eth.Contract(
      Web3Provider.abi,
      contractAddress,
    );
  }

  static async getGenesisBlock(nodeUrl: string, contractAddress: string) {
    const [ fistEvent ] = await Web3Provider.contract(nodeUrl, contractAddress).getPastEvents('Initialized', { fromBlock: 0 });
    return fistEvent?.blockNumber || 0;
  }
}
