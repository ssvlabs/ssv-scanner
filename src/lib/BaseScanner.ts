import { ethers } from 'ethers';
export interface SSVScannerParams {
  network: string,
  nodeUrl: string,
  ownerAddress: string,
}

export abstract class BaseScanner {
  protected DAY = 5400;
  protected WEEK = this.DAY * 7;
  protected MONTH = this.DAY * 30;
  protected progressBar: any;

  protected params: SSVScannerParams;

  constructor(scannerParams: SSVScannerParams) {
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
    this.params.ownerAddress = ethers.utils.getAddress(this.params.ownerAddress);
  }
}
