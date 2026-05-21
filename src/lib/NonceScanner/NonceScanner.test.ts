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
  });
});
