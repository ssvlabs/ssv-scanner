// @ts-nocheck
import { BaseScanner, SSVScannerParams } from './BaseScanner';

// Concrete implementation for testing the abstract class
class TestScanner extends BaseScanner {
  constructor(params: SSVScannerParams) {
    super(params);
  }
}

describe('BaseScanner', () => {
  const validParams: SSVScannerParams = {
    network: 'mainnet',
    nodeUrl: 'https://example.com',
    ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  };

  describe('constructor', () => {
    it('should throw error when nodeUrl is missing', () => {
      expect(() => {
        new TestScanner({
          ...validParams,
          nodeUrl: '',
        } as SSVScannerParams);
      }).toThrow('ETH1 node is required');
    });

    it('should throw error when network is missing', () => {
      expect(() => {
        new TestScanner({
          ...validParams,
          network: '',
        } as SSVScannerParams);
      }).toThrow('Network is required');
    });

    it('should throw error when ownerAddress is missing', () => {
      expect(() => {
        new TestScanner({
          ...validParams,
          ownerAddress: '',
        } as SSVScannerParams);
      }).toThrow('Cluster owner address is required');
    });

    it('should throw error when ownerAddress length is not 42', () => {
      expect(() => {
        new TestScanner({
          ...validParams,
          ownerAddress: '0x123',
        } as SSVScannerParams);
      }).toThrow('Invalid owner address length.');
    });

    it('should throw error when ownerAddress does not start with 0x', () => {
      expect(() => {
        new TestScanner({
          ...validParams,
          ownerAddress: 'xx1234567890abcdef1234567890abcdef12345678',
        } as SSVScannerParams);
      }).toThrow('Invalid owner address.');
    });

    it('should initialize successfully with valid params', () => {
      const scanner = new TestScanner(validParams);
      expect(scanner).toBeDefined();
    });

    it('should convert ownerAddress to checksum address', () => {
      const lowercaseAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const scanner = new TestScanner({
        ...validParams,
        ownerAddress: lowercaseAddress,
      });
      // ethers.getAddress converts to checksum format
      expect(scanner['params'].ownerAddress).toBe(
        '0x1234567890AbcdEF1234567890aBcdef12345678'
      );
    });

    it('should store params correctly', () => {
      const scanner = new TestScanner(validParams);
      expect(scanner['params'].network).toBe('mainnet');
      expect(scanner['params'].nodeUrl).toBe('https://example.com');
    });
  });

  describe('protected constants', () => {
    it('should have correct DAY value', () => {
      const scanner = new TestScanner(validParams);
      expect(scanner['DAY']).toBe(5400);
    });

    it('should have correct WEEK value', () => {
      const scanner = new TestScanner(validParams);
      expect(scanner['WEEK']).toBe(5400 * 7);
    });

    it('should have correct MONTH value', () => {
      const scanner = new TestScanner(validParams);
      expect(scanner['MONTH']).toBe(5400 * 30);
    });
  });
});
