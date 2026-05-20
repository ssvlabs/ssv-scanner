/// <reference types="jest" />
import { ContractVersion, getContractSettings } from './contract.provider';

describe('ContractVersion', () => {
  it('should contain MAINNET version', () => {
    expect(ContractVersion.MAINNET).toBe('prod:v4.mainnet');
  });

  it('should contain HOODI version', () => {
    expect(ContractVersion.HOODI).toBe('prod:v4.hoodi');
  });

  it('should contain HOODI_STAGE version', () => {
    expect(ContractVersion.HOODI_STAGE).toBe('stage:v4.hoodi');
  });

  it('should contain LOCAL_TESTNET version', () => {
    expect(ContractVersion.LOCAL_TESTNET).toBe('local:v4.testnet');
  });

  it('should contain FUSAKA_STAGE version', () => {
    expect(ContractVersion.FUSAKA_STAGE).toBe('stage:v4.fusaka');
  });
});

describe('getContractSettings', () => {
  describe('with valid network and environment', () => {
    it('should return correct settings for MAINNET', () => {
      const result = getContractSettings('MAINNET');
      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('abi');
      expect(result).toHaveProperty('genesisBlock');
      expect(result.contractAddress).toBe('0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1');
      expect(typeof result.abi).toBe('object');
      expect(Array.isArray(result.abi)).toBe(true);
      expect(result.genesisBlock).toBeDefined();
    });

    it('should return correct settings for HOODI', () => {
      const result = getContractSettings('HOODI');
      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('abi');
      expect(result).toHaveProperty('genesisBlock');
      expect(result.contractAddress).toBeDefined();
      expect(typeof result.abi).toBe('object');
      expect(Array.isArray(result.abi)).toBe(true);
    });

    it('should return correct settings for HOODI_STAGE', () => {
      const result = getContractSettings('HOODI_STAGE');
      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('abi');
      expect(result).toHaveProperty('genesisBlock');
      expect(result.contractAddress).toBeDefined();
      expect(typeof result.abi).toBe('object');
      expect(Array.isArray(result.abi)).toBe(true);
    });

    it('should return correct settings for LOCAL_TESTNET', () => {
      const result = getContractSettings('LOCAL_TESTNET');
      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('abi');
      expect(result).toHaveProperty('genesisBlock');
      expect(result.contractAddress).toBe('0xBFfF570853d97636b78ebf262af953308924D3D8');
      expect(result.genesisBlock).toBe(0);
      expect(typeof result.abi).toBe('object');
      expect(Array.isArray(result.abi)).toBe(true);
    });

    it('should return correct settings for FUSAKA_STAGE', () => {
      const result = getContractSettings('FUSAKA_STAGE');
      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('abi');
      expect(result).toHaveProperty('genesisBlock');
      expect(result.contractAddress).toBeDefined();
      expect(typeof result.abi).toBe('object');
      expect(Array.isArray(result.abi)).toBe(true);
    });
  });

  describe('with invalid network and environment', () => {
    it('should throw an error for an unknown network/env key', () => {
      expect(() => getContractSettings('UNKNOWN_NETWORK')).toThrow();
    });

    it('should throw TypeError for an empty string', () => {
      expect(() => getContractSettings('')).toThrow();
    });

    it('should throw for a random invalid string', () => {
      expect(() => getContractSettings('foobar')).toThrow();
    });
  });
});
