// @ts-nocheck
jest.mock('cli-progress', () => ({
  __esModule: true,
  default: {
    SingleBar: jest.fn(),
    Presets: { shades_classic: 'shades_classic' },
  },
}));

jest.mock('ethers', () => {
  const mockProvider = {
    getBlockNumber: jest.fn(),
  };
  const mockContract = {
    owner: jest.fn(),
    queryFilter: jest.fn(),
    filters: {
      ValidatorAdded: jest.fn().mockReturnValue('validatorAddedFilter'),
    },
  };
  return {
    ethers: {
      JsonRpcProvider: jest.fn().mockReturnValue(mockProvider),
      Contract: jest.fn().mockReturnValue(mockContract),
      getAddress: jest.fn((addr: string) => addr),
    },
    __mocks: {
      mockProvider,
      mockContract,
    },
  };
});

jest.mock('../contract.provider', () => ({
  getContractSettings: jest.fn(),
}));

import { NonceScanner } from './NonceScanner';
import { getContractSettings } from '../contract.provider';

const cliProgress = require('cli-progress').default;
const ethersModule = require('ethers');
const { ethers } = ethersModule;
const { mockProvider, mockContract } = ethersModule.__mocks;

describe('NonceScanner', () => {
  const validParams = {
    network: 'MAINNET',
    nodeUrl: 'https://example.com',
    ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  };

  const mockContractSettings = {
    contractAddress: '0xMockContractAddress',
    abi: [{ name: 'ValidatorAdded', type: 'event', inputs: [] }],
    genesisBlock: 1000,
  };

  let mockProgressBar: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProgressBar = {
      start: jest.fn(),
      update: jest.fn(),
      stop: jest.fn(),
    };
    cliProgress.SingleBar.mockReturnValue(mockProgressBar);

    (getContractSettings as jest.Mock).mockReturnValue(mockContractSettings);
  });

  describe('constructor', () => {
    it('should throw error when nodeUrl is missing', () => {
      expect(() => {
        new NonceScanner({
          ...validParams,
          nodeUrl: '',
        });
      }).toThrow('ETH1 node is required');
    });

    it('should throw error when network is missing', () => {
      expect(() => {
        new NonceScanner({
          ...validParams,
          network: '',
        });
      }).toThrow('Network is required');
    });

    it('should throw error when ownerAddress is missing', () => {
      expect(() => {
        new NonceScanner({
          ...validParams,
          ownerAddress: '',
        });
      }).toThrow('Cluster owner address is required');
    });

    it('should throw error when ownerAddress length is not 42', () => {
      expect(() => {
        new NonceScanner({
          ...validParams,
          ownerAddress: '0x123',
        });
      }).toThrow('Invalid owner address length.');
    });

    it('should throw error when ownerAddress does not start with 0x', () => {
      expect(() => {
        new NonceScanner({
          ...validParams,
          ownerAddress: 'xx1234567890abcdef1234567890abcdef12345678',
        });
      }).toThrow('Invalid owner address.');
    });

    it('should initialize successfully with valid params', () => {
      const scanner = new NonceScanner(validParams);
      expect(scanner).toBeDefined();
    });
  });

  describe('run', () => {
    it('should call _getValidatorAddedEventCount and return the result', async () => {
      const scanner = new NonceScanner(validParams);
      jest.spyOn(scanner, '_getValidatorAddedEventCount').mockResolvedValue(42);

      const result = await scanner.run(false);

      expect(result).toBe(42);
      expect(scanner._getValidatorAddedEventCount).toHaveBeenCalledWith(false);
    });

    it('should initialize progress bar when isCli is true', async () => {
      const scanner = new NonceScanner(validParams);
      jest.spyOn(scanner, '_getValidatorAddedEventCount').mockResolvedValue(42);

      await scanner.run(true);

      expect(cliProgress.SingleBar).toHaveBeenCalled();
    });

    it('should stop progress bar on success when isCli is true', async () => {
      const scanner = new NonceScanner(validParams);
      jest.spyOn(scanner, '_getValidatorAddedEventCount').mockResolvedValue(42);

      await scanner.run(true);

      expect(mockProgressBar.stop).toHaveBeenCalled();
    });

    it('should stop progress bar on error when isCli is true', async () => {
      const scanner = new NonceScanner(validParams);
      jest.spyOn(scanner, '_getValidatorAddedEventCount').mockRejectedValue(new Error('Test error'));

      await expect(scanner.run(true)).rejects.toThrow();

      expect(mockProgressBar.stop).toHaveBeenCalled();
    });

    it('should throw error when _getValidatorAddedEventCount fails', async () => {
      const scanner = new NonceScanner(validParams);
      jest.spyOn(scanner, '_getValidatorAddedEventCount').mockRejectedValue(new Error('Test error'));

      await expect(scanner.run(false)).rejects.toThrow();
    });

    it('should not initialize progress bar when isCli is false', async () => {
      const scanner = new NonceScanner(validParams);
      jest.spyOn(scanner, '_getValidatorAddedEventCount').mockResolvedValue(42);

      await scanner.run(false);

      expect(cliProgress.SingleBar).not.toHaveBeenCalled();
    });
  });

  describe('_getValidatorAddedEventCount', () => {
    it('should call getContractSettings with the correct network', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      expect(getContractSettings).toHaveBeenCalledWith('MAINNET');
    });

    it('should create JsonRpcProvider with correct nodeUrl', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://example.com');
    });

    it('should create Contract with correct parameters', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      expect(ethers.Contract).toHaveBeenCalledWith(
        '0xMockContractAddress',
        mockContractSettings.abi,
        mockProvider
      );
    });

    it('should throw error when getBlockNumber fails', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockRejectedValue(new Error('Network error'));

      await expect(scanner._getValidatorAddedEventCount()).rejects.toThrow(
        'Could not access the provided node endpoint.'
      );
    });

    it('should throw error when contract.owner fails', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockRejectedValue(new Error('Contract error'));

      await expect(scanner._getValidatorAddedEventCount()).rejects.toThrow(
        'Could not find any cluster snapshot from the provided contract address.'
      );
    });

    it('should query logs in block ranges', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      // MONTH = 5400 * 30 = 162000, so endBlock = min(1000 + 162000 - 1, 2000) = 2000
      expect(mockContract.queryFilter).toHaveBeenCalledWith(
        'validatorAddedFilter',
        1000,
        2000
      );
    });

    it('should handle empty logs and return 0', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      const result = await scanner._getValidatorAddedEventCount();

      expect(result).toBe(0);
    });

    it('should return correct event count when logs are found', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([
        { data: '0xdata1' },
        { data: '0xdata2' },
        { data: '0xdata3' },
      ]);

      const result = await scanner._getValidatorAddedEventCount();

      expect(result).toBe(3);
    });

    it('should reduce blockStep from MONTH to WEEK on error', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // First call (MONTH range) fails, then all subsequent calls (WEEK range) succeed
      mockContract.queryFilter
        .mockRejectedValueOnce(new Error('Too many blocks'))
        .mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      // After error, blockStep reduces from MONTH to WEEK, and loop continues with more iterations
      const callCount = mockContract.queryFilter.mock.calls.length;
      expect(callCount).toBeGreaterThan(1);
    });

    it('should reduce blockStep from WEEK to DAY on error', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // First call (MONTH) fails, second call (WEEK) fails, rest succeed
      mockContract.queryFilter
        .mockRejectedValueOnce(new Error('Too many blocks'))
        .mockRejectedValueOnce(new Error('Still too many blocks'))
        .mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      // After two errors, blockStep reduces to DAY and loop continues
      const callCount = mockContract.queryFilter.mock.calls.length;
      expect(callCount).toBeGreaterThan(2);
    });

    it('should throw error when all blockStep reductions fail', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(500000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // MONTH fails -> WEEK fails -> DAY fails -> throw
      mockContract.queryFilter
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'));

      await expect(scanner._getValidatorAddedEventCount()).rejects.toThrow();
    });

    it('should call progress bar start when isCli is true', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      scanner['progressBar'] = mockProgressBar;

      await scanner._getValidatorAddedEventCount(true);

      expect(mockProgressBar.start).toHaveBeenCalled();
    });

    it('should call progress bar update when isCli is true', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      scanner['progressBar'] = mockProgressBar;

      await scanner._getValidatorAddedEventCount(true);

      expect(mockProgressBar.update).toHaveBeenCalled();
    });

    it('should call progress bar stop on success when isCli is true', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      scanner['progressBar'] = mockProgressBar;

      await scanner.run(true);

      expect(mockProgressBar.stop).toHaveBeenCalled();
    });

    it('should use ValidatorAdded filter with ownerAddress', async () => {
      const scanner = new NonceScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getValidatorAddedEventCount();

      expect(mockContract.filters.ValidatorAdded).toHaveBeenCalledWith(
        '0x1234567890abcdef1234567890abcdef12345678'
      );
    });

    it('should handle multiple block ranges and accumulate event counts', async () => {
      const scanner = new NonceScanner(validParams);
      // Set latestBlock to be beyond genesisBlock + MONTH so multiple iterations occur
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // Return different log counts for different calls
      mockContract.queryFilter
        .mockResolvedValueOnce([{ data: '0xdata1' }, { data: '0xdata2' }])
        .mockResolvedValueOnce([{ data: '0xdata3' }])
        .mockResolvedValue([]);

      const result = await scanner._getValidatorAddedEventCount();

      expect(result).toBeGreaterThanOrEqual(3);
    });
  });
});
