// @ts-nocheck
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(),
}));

jest.mock('cli-progress', () => ({
  __esModule: true,
  default: {
    SingleBar: jest.fn(),
    Presets: { shades_classic: 'shades_classic' },
  },
}));

jest.mock('ethers', () => {
  const mockAbiCoder = {
    decode: jest.fn(),
  };
  const mockProvider = {
    getBlockNumber: jest.fn(),
  };
  const mockContract = {
    owner: jest.fn(),
    queryFilter: jest.fn(),
    filters: {
      OperatorAdded: jest.fn().mockReturnValue('operatorAddedFilter'),
    },
  };
  const mockInterface = {
    parseLog: jest.fn(),
    decodeEventLog: jest.fn(),
  };
  return {
    AbiCoder: {
      defaultAbiCoder: jest.fn().mockReturnValue(mockAbiCoder),
    },
    ethers: {
      JsonRpcProvider: jest.fn().mockReturnValue(mockProvider),
      Contract: jest.fn().mockReturnValue(mockContract),
      Interface: jest.fn().mockReturnValue(mockInterface),
      getAddress: jest.fn((addr: string) => addr),
    },
    __mocks: {
      mockAbiCoder,
      mockProvider,
      mockContract,
      mockInterface,
    },
  };
});

jest.mock('../contract.provider', () => ({
  getContractSettings: jest.fn(),
}));

import { OperatorScanner } from './OperatorScanner';
import { getContractSettings } from '../contract.provider';

const fs = require('fs');
const path = require('path');
const cliProgress = require('cli-progress').default;
const ethersModule = require('ethers');
const { AbiCoder, ethers } = ethersModule;
const { mockAbiCoder, mockProvider, mockContract, mockInterface } = ethersModule.__mocks;

describe('OperatorScanner', () => {
  const validParams = {
    network: 'MAINNET',
    nodeUrl: 'https://example.com',
    ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  };

  const mockContractSettings = {
    contractAddress: '0xMockContractAddress',
    abi: [{ name: 'OperatorAdded', type: 'event', inputs: [] }],
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

    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue(undefined);
    fs.writeFileSync.mockReturnValue(undefined);

    path.join.mockImplementation((...args: string[]) => args.join('/'));
  });

  describe('constructor', () => {
    it('should throw error when nodeUrl is missing', () => {
      expect(() => {
        new OperatorScanner({
          ...validParams,
          nodeUrl: '',
        });
      }).toThrow('ETH1 node is required');
    });

    it('should throw error when network is missing', () => {
      expect(() => {
        new OperatorScanner({
          ...validParams,
          network: '',
        });
      }).toThrow('Network is required');
    });

    it('should throw error when ownerAddress is missing', () => {
      expect(() => {
        new OperatorScanner({
          ...validParams,
          ownerAddress: '',
        });
      }).toThrow('Cluster owner address is required');
    });

    it('should throw error when ownerAddress length is not 42', () => {
      expect(() => {
        new OperatorScanner({
          ...validParams,
          ownerAddress: '0x123',
        });
      }).toThrow('Invalid owner address length.');
    });

    it('should throw error when ownerAddress does not start with 0x', () => {
      expect(() => {
        new OperatorScanner({
          ...validParams,
          ownerAddress: 'xx1234567890abcdef1234567890abcdef12345678',
        });
      }).toThrow('Invalid owner address.');
    });

    it('should initialize successfully with valid params', () => {
      const scanner = new OperatorScanner(validParams);
      expect(scanner).toBeDefined();
    });
  });

  describe('run', () => {
    it('should call _getOperatorPubkeys and return the result', async () => {
      const scanner = new OperatorScanner(validParams);
      jest.spyOn(scanner, '_getOperatorPubkeys').mockResolvedValue('/mock/path/file.json');

      const result = await scanner.run('/mock/path', false);

      expect(result).toBe('/mock/path/file.json');
      expect(scanner._getOperatorPubkeys).toHaveBeenCalledWith('/mock/path', false);
    });

    it('should initialize progress bar when isCli is true', async () => {
      const scanner = new OperatorScanner(validParams);
      jest.spyOn(scanner, '_getOperatorPubkeys').mockResolvedValue('/mock/path/file.json');

      await scanner.run('/mock/path', true);

      expect(cliProgress.SingleBar).toHaveBeenCalled();
    });

    it('should stop progress bar on success when isCli is true', async () => {
      const scanner = new OperatorScanner(validParams);
      jest.spyOn(scanner, '_getOperatorPubkeys').mockResolvedValue('/mock/path/file.json');

      await scanner.run('/mock/path', true);

      expect(mockProgressBar.stop).toHaveBeenCalled();
    });

    it('should stop progress bar on error when isCli is true', async () => {
      const scanner = new OperatorScanner(validParams);
      jest.spyOn(scanner, '_getOperatorPubkeys').mockRejectedValue(new Error('Test error'));

      await expect(scanner.run('/mock/path', true)).rejects.toThrow();

      expect(mockProgressBar.stop).toHaveBeenCalled();
    });

    it('should throw error when _getOperatorPubkeys fails', async () => {
      const scanner = new OperatorScanner(validParams);
      jest.spyOn(scanner, '_getOperatorPubkeys').mockRejectedValue(new Error('Test error'));

      await expect(scanner.run('/mock/path', false)).rejects.toThrow();
    });

    it('should not initialize progress bar when isCli is false', async () => {
      const scanner = new OperatorScanner(validParams);
      jest.spyOn(scanner, '_getOperatorPubkeys').mockResolvedValue('/mock/path/file.json');

      await scanner.run('/mock/path', false);

      expect(cliProgress.SingleBar).not.toHaveBeenCalled();
    });
  });

  describe('_getOperatorPubkeys', () => {
    it('should call getContractSettings with the correct network', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      expect(getContractSettings).toHaveBeenCalledWith('MAINNET');
    });

    it('should create JsonRpcProvider with correct nodeUrl', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://example.com');
    });

    it('should create Contract with correct parameters', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      expect(ethers.Contract).toHaveBeenCalledWith(
        '0xMockContractAddress',
        mockContractSettings.abi,
        mockProvider
      );
    });

    it('should create Interface with correct abi', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      expect(ethers.Interface).toHaveBeenCalledWith(mockContractSettings.abi);
    });

    it('should throw error when getBlockNumber fails', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockRejectedValue(new Error('Network error'));

      await expect(scanner._getOperatorPubkeys()).rejects.toThrow(
        'Could not access the provided node endpoint.'
      );
    });

    it('should throw error when contract.owner fails', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockRejectedValue(new Error('Contract error'));

      await expect(scanner._getOperatorPubkeys()).rejects.toThrow(
        'Could not find any cluster snapshot from the provided contract address.'
      );
    });

    it('should query logs in block ranges', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      // MONTH = 5400 * 30 = 162000, so endBlock = min(1000 + 162000 - 1, 2000) = 2000
      expect(mockContract.queryFilter).toHaveBeenCalledWith(
        'operatorAddedFilter',
        1000,
        2000
      );
    });

    it('should handle empty logs and return file path', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      const result = await scanner._getOperatorPubkeys();

      expect(result).toContain('operator-pubkeys-MAINNET.json');
    });

    it('should reduce blockStep from MONTH to WEEK on error', async () => {
      const scanner = new OperatorScanner(validParams);
      // Use a block range where MONTH fails once, then WEEK succeeds for remaining iterations
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // First call (MONTH range) fails, then all subsequent calls (WEEK range) succeed
      mockContract.queryFilter
        .mockRejectedValueOnce(new Error('Too many blocks'))
        .mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      // After error, blockStep reduces from MONTH to WEEK, and loop continues with more iterations
      const callCount = mockContract.queryFilter.mock.calls.length;
      expect(callCount).toBeGreaterThan(1);
    });

    it('should reduce blockStep from WEEK to DAY on error', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(200000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // First call (MONTH) fails, second call (WEEK) fails, rest succeed
      mockContract.queryFilter
        .mockRejectedValueOnce(new Error('Too many blocks'))
        .mockRejectedValueOnce(new Error('Still too many blocks'))
        .mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      // After two errors, blockStep reduces to DAY and loop continues
      const callCount = mockContract.queryFilter.mock.calls.length;
      expect(callCount).toBeGreaterThan(2);
    });

    it('should throw error when all blockStep reductions fail', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(500000);
      mockContract.owner.mockResolvedValue('0xOwner');
      // MONTH fails -> WEEK fails -> DAY fails -> throw
      mockContract.queryFilter
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'));

      await expect(scanner._getOperatorPubkeys()).rejects.toThrow();
    });

    it('should create output directory if it does not exist', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      fs.existsSync.mockReturnValueOnce(false);

      await scanner._getOperatorPubkeys();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        { recursive: true }
      );
    });

    it('should not create directory if it already exists', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      fs.existsSync.mockReturnValue(true);

      await scanner._getOperatorPubkeys();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should use custom outputPath when provided', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      path.join.mockReturnValue('/custom/output/path');

      await scanner._getOperatorPubkeys('/custom/output');

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('custom/output'),
        { recursive: true }
      );
    });

    it('should clear existing file content if file exists', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);

      await scanner._getOperatorPubkeys();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('operator-pubkeys-MAINNET.json'),
        ''
      );
    });

    it('should process logs and write entries to file', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLog = {
        data: '0xmockdata',
        topics: ['0xtopic'],
      };
      mockContract.queryFilter.mockResolvedValue([mockLog]);

      mockInterface.parseLog.mockReturnValue({
        args: ['0xOperatorId', '0xPubkey', '0xEncodedPubkey'],
      });
      mockInterface.decodeEventLog.mockReturnValue([
        '0xOperatorId',
        '0xPubkey',
        '0xEncodedPubkey',
      ]);

      mockAbiCoder.decode.mockReturnValue(['decodedPubkey']);

      const result = await scanner._getOperatorPubkeys();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('operator-pubkeys-MAINNET.json'),
        JSON.stringify([{ id: 1, pubkey: 'decodedPubkey' }], null, 2)
      );
      expect(result).toContain('operator-pubkeys-MAINNET.json');
    });

    it('should handle multiple logs correctly', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLogs = [
        { data: '0xdata1', topics: ['0xtopic1'] },
        { data: '0xdata2', topics: ['0xtopic2'] },
      ];
      mockContract.queryFilter.mockResolvedValue(mockLogs);

      mockInterface.parseLog.mockReturnValue({
        args: ['0xOperatorId', '0xPubkey', '0xEncodedPubkey'],
      });
      mockInterface.decodeEventLog.mockReturnValue([
        '0xOperatorId',
        '0xPubkey',
        '0xEncodedPubkey',
      ]);

      mockAbiCoder.decode.mockReturnValue(['decodedPubkey']);

      await scanner._getOperatorPubkeys();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('operator-pubkeys-MAINNET.json'),
        JSON.stringify(
          [
            { id: 1, pubkey: 'decodedPubkey' },
            { id: 2, pubkey: 'decodedPubkey' },
          ],
          null,
          2
        )
      );
    });

    it('should use raw value when abi decoding fails', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLog = { data: '0xmockdata', topics: ['0xtopic'] };
      mockContract.queryFilter.mockResolvedValue([mockLog]);

      mockInterface.parseLog.mockReturnValue({
        args: ['0xOperatorId', '0xPubkey', 'rawPubkey'],
      });
      mockInterface.decodeEventLog.mockReturnValue([
        '0xOperatorId',
        '0xPubkey',
        'rawPubkey',
      ]);

      mockAbiCoder.decode.mockImplementation(() => {
        throw new Error('Decoding error');
      });

      await scanner._getOperatorPubkeys();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('operator-pubkeys-MAINNET.json'),
        JSON.stringify([{ id: 1, pubkey: 'rawPubkey' }], null, 2)
      );
    });

    it('should throw error when parseLog returns null', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLog = { data: '0xmockdata', topics: ['0xtopic'] };
      mockContract.queryFilter.mockResolvedValue([mockLog]);

      mockInterface.parseLog.mockReturnValue(null);

      await expect(scanner._getOperatorPubkeys()).rejects.toThrow(
        'Could not parse the log'
      );
    });

    it('should throw error when parseLog returns undefined', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');

      const mockLog = { data: '0xmockdata', topics: ['0xtopic'] };
      mockContract.queryFilter.mockResolvedValue([mockLog]);

      mockInterface.parseLog.mockReturnValue(undefined);

      await expect(scanner._getOperatorPubkeys()).rejects.toThrow(
        'Could not parse the log'
      );
    });

    it('should call progress bar start when isCli is true', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      scanner['progressBar'] = mockProgressBar;

      await scanner._getOperatorPubkeys(undefined, true);

      expect(mockProgressBar.start).toHaveBeenCalled();
    });

    it('should call progress bar update when isCli is true', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);
      scanner['progressBar'] = mockProgressBar;

      await scanner._getOperatorPubkeys(undefined, true);

      expect(mockProgressBar.update).toHaveBeenCalled();
    });

    it('should use default output path when outputPath is not provided', async () => {
      const scanner = new OperatorScanner(validParams);
      mockProvider.getBlockNumber.mockResolvedValue(2000);
      mockContract.owner.mockResolvedValue('0xOwner');
      mockContract.queryFilter.mockResolvedValue([]);

      await scanner._getOperatorPubkeys();

      expect(path.join).toHaveBeenCalled();
    });
  });
});
