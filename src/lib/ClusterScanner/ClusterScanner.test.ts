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
    getLogs: jest.fn(),
  };
  const mockContract = {
    owner: jest.fn(),
    interface: {
      parseLog: jest.fn(),
    },
  };
  return {
    ethers: {
      JsonRpcProvider: jest.fn().mockReturnValue(mockProvider),
      Contract: jest.fn().mockReturnValue(mockContract),
      zeroPadValue: jest.fn((value: string, length: number) => `0x${value.slice(2).padStart(length, '0')}`),
      getAddress: jest.fn((addr: string) => addr),
      Log: jest.fn(),
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

import { ClusterScanner } from './ClusterScanner';
import { getContractSettings } from '../contract.provider';

const cliProgress = require('cli-progress').default;
const ethersModule = require('ethers');
const { ethers } = ethersModule;
const { mockProvider, mockContract } = ethersModule.__mocks;

describe('ClusterScanner', () => {
  const validParams = {
    network: 'MAINNET',
    nodeUrl: 'https://example.com',
    ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  };

  const mockContractSettings = {
    contractAddress: '0xMockContractAddress',
    abi: [{ name: 'ClusterDeposited', type: 'event', inputs: [] }],
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
        new ClusterScanner({
          ...validParams,
          nodeUrl: '',
        });
      }).toThrow('ETH1 node is required');
    });

    it('should throw error when network is missing', () => {
      expect(() => {
        new ClusterScanner({
          ...validParams,
          network: '',
        });
      }).toThrow('Network is required');
    });

    it('should throw error when ownerAddress is missing', () => {
      expect(() => {
        new ClusterScanner({
          ...validParams,
          ownerAddress: '',
        });
      }).toThrow('Cluster owner address is required');
    });

    it('should throw error when ownerAddress length is not 42', () => {
      expect(() => {
        new ClusterScanner({
          ...validParams,
          ownerAddress: '0x123',
        });
      }).toThrow('Invalid owner address length.');
    });

    it('should throw error when ownerAddress does not start with 0x', () => {
      expect(() => {
        new ClusterScanner({
          ...validParams,
          ownerAddress: 'xx1234567890abcdef1234567890abcdef12345678',
        });
      }).toThrow('Invalid owner address.');
    });

    it('should initialize successfully with valid params', () => {
      const scanner = new ClusterScanner(validParams);
      expect(scanner).toBeDefined();
    });
  });

  describe('run', () => {
    it('should throw error when operatorIds is not an array', async () => {
      const scanner = new ClusterScanner(validParams);
      await expect(scanner.run(null as any, false)).rejects.toThrow(
        'Comma-separated list of operator IDs. The amount must be 3f+1 compatible.'
      );
    });

    it('should throw error when operatorIds length is less than 4', async () => {
      const scanner = new ClusterScanner(validParams);
      await expect(scanner.run([1, 2, 3], false)).rejects.toThrow(
        'Comma-separated list of operator IDs. The amount must be 3f+1 compatible.'
      );
    });

    it('should throw error when operatorIds length is greater than 13', async () => {
      const scanner = new ClusterScanner(validParams);
      const tooManyIds = Array.from({ length: 14 }, (_, i) => i + 1);
      await expect(scanner.run(tooManyIds, false)).rejects.toThrow(
        'Comma-separated list of operator IDs. The amount must be 3f+1 compatible.'
      );
    });

    it('should throw error when operatorIds length is not 3f+1 compatible (e.g., 5)', async () => {
      const scanner = new ClusterScanner(validParams);
      await expect(scanner.run([1, 2, 3, 4, 5], false)).rejects.toThrow(
        'Comma-separated list of operator IDs. The amount must be 3f+1 compatible.'
      );
    });

    it('should throw error when operatorIds length is not 3f+1 compatible (e.g., 6)', async () => {
      const scanner = new ClusterScanner(validParams);
      await expect(scanner.run([1, 2, 3, 4, 5, 6], false)).rejects.toThrow(
        'Comma-separated list of operator IDs. The amount must be 3f+1 compatible.'
      );
    });
  });

  describe('_getClusterSnapshot', () => {
    it('should throw error when getBlockNumber fails', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockRejectedValue(new Error('Network error'));

      await expect(scanner.run([1, 2, 3, 4], false)).rejects.toThrow(
        'Could not access the provided node endpoint:'
      );
    });

    it('should throw error when contract.owner fails', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockRejectedValue(new Error('Contract error'));

      await expect(scanner.run([1, 2, 3, 4], false)).rejects.toThrow(
        'Could not find any cluster snapshot from the provided contract address:'
      );
    });
  });
});
