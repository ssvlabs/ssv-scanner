import Web3Provider from './web3.provider';

export interface SSVScannerParams {
  nodeUrl: string,
  ownerAddress: string,
  contractAddress: string,
}

export abstract class BaseScanner {
  protected DAY = 5400;
  protected WEEK = this.DAY * 7;
  protected MONTH = this.DAY * 30;
  protected progressBar: any;

  protected params: SSVScannerParams;

  constructor(scannerParams: SSVScannerParams) {
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
    this.params.contractAddress = Web3Provider.web3().utils.toChecksumAddress(this.params.contractAddress);
    this.params.ownerAddress = Web3Provider.web3().utils.toChecksumAddress(this.params.ownerAddress);
  }
}