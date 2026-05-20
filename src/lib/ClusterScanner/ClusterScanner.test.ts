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

    it('should accept valid 3f+1 operatorIds (4 operators)', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);
      expect(result).toBeDefined();
      expect(result.cluster).toBeDefined();
    });

    it('should accept valid 3f+1 operatorIds (7 operators)', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4, 5, 6, 7], false);
      expect(result).toBeDefined();
      expect(result.cluster).toBeDefined();
    });

    it('should accept valid 3f+1 operatorIds (10 operators)', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], false);
      expect(result).toBeDefined();
      expect(result.cluster).toBeDefined();
    });

    it('should accept valid 3f+1 operatorIds (13 operators)', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        false
      );
      expect(result).toBeDefined();
      expect(result.cluster).toBeDefined();
    });

    it('should sort operatorIds in ascending order', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([4, 2, 3, 1], false);

      expect(mockProvider.getLogs).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
      const filter = mockProvider.getLogs.mock.calls[0][0];
      expect(filter.topics[1]).toBeDefined();
    });

    it('should initialize progress bar when isCli is true', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], true);

      expect(cliProgress.SingleBar).toHaveBeenCalled();
    });

    it('should stop progress bar on success when isCli is true', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], true);

      expect(mockProgressBar.stop).toHaveBeenCalled();
    });

    it('should not initialize progress bar when isCli is false', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(cliProgress.SingleBar).not.toHaveBeenCalled();
    });

    it('should not stop progress bar when isCli is false', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(mockProgressBar.stop).not.toHaveBeenCalled();
    });
  });

  describe('_getClusterSnapshot', () => {
    it('should call getContractSettings with the correct network', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(getContractSettings).toHaveBeenCalledWith('MAINNET');
    });

    it('should create JsonRpcProvider with correct nodeUrl', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://example.com');
    });

    it('should create Contract with correct parameters', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(ethers.Contract).toHaveBeenCalledWith(
        '0xMockContractAddress',
        mockContractSettings.abi,
        mockProvider
      );
    });

    it('should call contract.owner() to verify contract', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(mockContract.owner).toHaveBeenCalled();
    });

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

    it('should return default cluster when no events are found', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.payload).toBeDefined();
      expect(result.cluster).toEqual({
        validatorCount: 0,
        networkFeeIndex: '0',
        index: '0',
        active: true,
        balance: '0',
      });
    });

    it('should return payload with correct owner and operators', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.payload['Owner']).toBe(validParams.ownerAddress);
      expect(result.payload['Operators']).toBe('1,2,3,4');
    });

    it('should return payload with correct block number', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.payload['Block']).toBe(2000);
    });

    it('should return payload with default Data when no events found', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.payload['Data']).toBe('0,0,0,true,0');
    });

    it('should call getLogs with correct filter parameters', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(mockProvider.getLogs).toHaveBeenCalled();
      const filter = mockProvider.getLogs.mock.calls[0][0];
      expect(filter.address).toBe('0xMockContractAddress');
      expect(filter.fromBlock).toBeDefined();
      expect(filter.toBlock).toBeDefined();
    });

    it('should process matching cluster events and return cluster data', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['5', '1000000', '2000000', true, '3000000'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterDeposited',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 5,
        networkFeeIndex: '1000000',
        index: '2000000',
        active: true,
        balance: '3000000',
      });
    });

    it('should filter events by operatorIds', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['5', '1000000', '2000000', true, '3000000'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterDeposited',
            args: {
              operatorIds: [5n, 6n, 7n, 8n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 0,
        networkFeeIndex: '0',
        index: '0',
        active: true,
        balance: '0',
      });
    });

    it('should handle ClusterWithdrawn event', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['3', '500000', '1000000', true, '1500000'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterWithdrawn',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 3,
        networkFeeIndex: '500000',
        index: '1000000',
        active: true,
        balance: '1500000',
      });
    });

    it('should handle ClusterReactivated event', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['2', '250000', '500000', true, '750000'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterReactivated',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 2,
        networkFeeIndex: '250000',
        index: '500000',
        active: true,
        balance: '750000',
      });
    });

    it('should handle ValidatorRemoved event', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['1', '100000', '200000', true, '300000'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ValidatorRemoved',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 1,
        networkFeeIndex: '100000',
        index: '200000',
        active: true,
        balance: '300000',
      });
    });

    it('should handle ValidatorAdded event', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['4', '800000', '1600000', true, '2400000'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ValidatorAdded',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 4,
        networkFeeIndex: '800000',
        index: '1600000',
        active: true,
        balance: '2400000',
      });
    });

    it('should handle ClusterLiquidated event', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['6', '1200000', '2400000', false, '0'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterLiquidated',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 6,
        networkFeeIndex: '1200000',
        index: '2400000',
        active: false,
        balance: '0',
      });
    });

    it('should ignore events not in the eventsList', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'SomeOtherEvent',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: ['10', '2000000', '4000000', true, '6000000'],
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 0,
        networkFeeIndex: '0',
        index: '0',
        active: true,
        balance: '0',
      });
    });

    it('should ignore logs with null parsed event', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue(null),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster).toEqual({
        validatorCount: 0,
        networkFeeIndex: '0',
        index: '0',
        active: true,
        balance: '0',
      });
    });

    it('should reduce blockStep from MONTH to WEEK on error', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs
        .mockRejectedValueOnce(new Error('Too many blocks'))
        .mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result).toBeDefined();
      expect(result.cluster).toBeDefined();
    });

    it('should reduce blockStep from WEEK to DAY on error', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs
        .mockRejectedValueOnce(new Error('Too many blocks'))
        .mockRejectedValueOnce(new Error('Still too many blocks'))
        .mockResolvedValue([]);

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result).toBeDefined();
      expect(result.cluster).toBeDefined();
    });

    it('should call progress bar start when isCli is true', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], true);

      expect(mockProgressBar.start).toHaveBeenCalled();
    });

    it('should call progress bar update when isCli is true', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], true);

      expect(mockProgressBar.update).toHaveBeenCalled();
    });

    it('should use zeroPadValue for owner address in topics', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockProvider.getLogs.mockResolvedValue([]);

      await scanner.run([1, 2, 3, 4], false);

      expect(ethers.zeroPadValue).toHaveBeenCalledWith(
        validParams.ownerAddress,
        32
      );
    });

    it('should return cluster with active as boolean', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['1', '100', '200', false, '300'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterDeposited',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster.active).toBe(false);
    });

    it('should convert validatorCount to number', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['10', '100', '200', true, '300'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterDeposited',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(result.cluster.validatorCount).toBe(10);
      expect(typeof result.cluster.validatorCount).toBe('number');
    });

    it('should convert numeric cluster fields to string', async () => {
      const scanner = new ClusterScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockClusterSnapshot = ['1', '100', '200', true, '300'];
      const mockLog = {
        blockNumber: 1500,
        transactionIndex: 0,
        index: 0,
      };
      mockProvider.getLogs.mockResolvedValue([mockLog]);

      ethers.Contract.mockReturnValue({
        ...mockContract,
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'ClusterDeposited',
            args: {
              operatorIds: [1n, 2n, 3n, 4n],
              cluster: mockClusterSnapshot,
            },
          }),
        },
        owner: mockContract.owner,
      });

      const result = await scanner.run([1, 2, 3, 4], false);

      expect(typeof result.cluster.networkFeeIndex).toBe('string');
      expect(typeof result.cluster.index).toBe('string');
      expect(typeof result.cluster.balance).toBe('string');
    });
  });
});
