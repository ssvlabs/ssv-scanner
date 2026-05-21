/// <reference types="jest" />
import { ClusterScanner } from './lib/ClusterScanner/ClusterScanner';
import { NonceScanner } from './lib/NonceScanner/NonceScanner';

describe('main.ts exports', () => {
  it('should export ClusterScanner', () => {
    expect(ClusterScanner).toBeDefined();
    expect(typeof ClusterScanner).toBe('function');
  });

  it('should export NonceScanner', () => {
    expect(NonceScanner).toBeDefined();
    expect(typeof NonceScanner).toBe('function');
  });

  it('ClusterScanner should be instantiable with valid params', () => {
    const scanner = new ClusterScanner({
      network: 'mainnet',
      nodeUrl: 'https://example.com',
      ownerAddress: '0x1234567890123456789012345678901234567890',
    });
    expect(scanner).toBeInstanceOf(ClusterScanner);
  });

  it('NonceScanner should be instantiable with valid params', () => {
    const scanner = new NonceScanner({
      network: 'mainnet',
      nodeUrl: 'https://example.com',
      ownerAddress: '0x1234567890123456789012345678901234567890',
    });
    expect(scanner).toBeInstanceOf(NonceScanner);
  });

  it('ClusterScanner should throw if nodeUrl is missing', () => {
    expect(() => {
      new ClusterScanner({
        network: 'mainnet',
        nodeUrl: '',
        ownerAddress: '0x1234567890123456789012345678901234567890',
      });
    }).toThrow('ETH1 node is required');
  });

  it('ClusterScanner should throw if network is missing', () => {
    expect(() => {
      new ClusterScanner({
        network: '',
        nodeUrl: 'https://example.com',
        ownerAddress: '0x1234567890123456789012345678901234567890',
      });
    }).toThrow('Network is required');
  });

  it('ClusterScanner should throw if ownerAddress is missing', () => {
    expect(() => {
      new ClusterScanner({
        network: 'mainnet',
        nodeUrl: 'https://example.com',
        ownerAddress: '',
      });
    }).toThrow('Cluster owner address is required');
  });

  it('NonceScanner should throw if nodeUrl is missing', () => {
    expect(() => {
      new NonceScanner({
        network: 'mainnet',
        nodeUrl: '',
        ownerAddress: '0x1234567890123456789012345678901234567890',
      });
    }).toThrow('ETH1 node is required');
  });

  it('NonceScanner should throw if network is missing', () => {
    expect(() => {
      new NonceScanner({
        network: '',
        nodeUrl: 'https://example.com',
        ownerAddress: '0x1234567890123456789012345678901234567890',
      });
    }).toThrow('Network is required');
  });

  it('NonceScanner should throw if ownerAddress is missing', () => {
    expect(() => {
      new NonceScanner({
        network: 'mainnet',
        nodeUrl: 'https://example.com',
        ownerAddress: '',
      });
    }).toThrow('Cluster owner address is required');
  });
});
