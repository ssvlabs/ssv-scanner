// @ts-nocheck
jest.mock('../lib/OperatorScanner/OperatorScanner', () => {
  return {
    OperatorScanner: jest.fn().mockImplementation(() => ({
      run: jest.fn(),
    })),
  };
});

import { OperatorCommand } from './OperatorCommand';
import { OperatorScanner } from '../lib/OperatorScanner/OperatorScanner';

describe('OperatorCommand', () => {
  let command: OperatorCommand;
  let mockOperatorScannerRun: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockOperatorScannerRun = jest.fn();
    (OperatorScanner as jest.Mock).mockImplementation(() => ({
      run: mockOperatorScannerRun,
    }));

    command = new OperatorCommand();
  });

  describe('constructor', () => {
    it('should initialize with correct name and description', () => {
      expect(command.name).toBe('operator');
      expect(command['description']).toBe('Handles cluster operations');
    });
  });

  describe('setArguments', () => {
    it('should have parser with required arguments', () => {
      const parser = command['parser'];
      const actions = parser._actions;
      const argNames = actions.map((a: any) => a.dest);

      expect(argNames).toContain('network');
      expect(argNames).toContain('nodeUrl');
      expect(argNames).toContain('ownerAddress');
      expect(argNames).toContain('outputPath');
    });

    it('should require network argument with correct choices', () => {
      const parser = command['parser'];
      const networkAction = parser._actions.find((a: any) => a.dest === 'network');

      expect(networkAction).toBeDefined();
      expect(networkAction.required).toBe(true);
      expect(networkAction.choices).toEqual(['mainnet', 'hoodi', 'hoodi_stage', 'local_testnet', 'fusaka']);
    });

    it('should require nodeUrl argument', () => {
      const parser = command['parser'];
      const nodeUrlAction = parser._actions.find((a: any) => a.dest === 'nodeUrl');

      expect(nodeUrlAction).toBeDefined();
      expect(nodeUrlAction.required).toBe(true);
    });

    it('should require ownerAddress argument', () => {
      const parser = command['parser'];
      const ownerAddressAction = parser._actions.find((a: any) => a.dest === 'ownerAddress');

      expect(ownerAddressAction).toBeDefined();
      expect(ownerAddressAction.required).toBe(true);
    });

    it('should make outputPath argument optional', () => {
      const parser = command['parser'];
      const outputPathAction = parser._actions.find((a: any) => a.dest === 'outputPath');

      expect(outputPathAction).toBeDefined();
      expect(outputPathAction.required).toBe(false);
    });
  });

  describe('run', () => {
    const validArgs = {
      network: 'mainnet',
      nodeUrl: 'http://localhost:8545',
      ownerAddress: '0x1234567890abcdef',
      outputPath: '/tmp/output',
    };

    it('should create OperatorScanner with provided args', async () => {
      mockOperatorScannerRun.mockResolvedValue('/tmp/output/result.json');

      await command.run(validArgs);

      expect(OperatorScanner).toHaveBeenCalledWith(validArgs);
    });

    it('should call operatorScanner.run with outputPath and isCli=true', async () => {
      mockOperatorScannerRun.mockResolvedValue('/tmp/output/result.json');

      await command.run(validArgs);

      expect(mockOperatorScannerRun).toHaveBeenCalledWith('/tmp/output', true);
    });

    it('should log success message with result path', async () => {
      const resultPath = '/tmp/output/result.json';
      mockOperatorScannerRun.mockResolvedValue(resultPath);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith(
        `\nOperator data has been saved to:\n ${resultPath}`
      );
    });

    it('should log error message when run throws', async () => {
      const errorMessage = 'Network error';
      mockOperatorScannerRun.mockRejectedValue(new Error(errorMessage));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', errorMessage);
    });

    it('should pass undefined as outputPath when not provided', async () => {
      const argsWithoutOutput = {
        network: 'hoodi',
        nodeUrl: 'http://localhost:8545',
        ownerAddress: '0xabcdef',
      };
      mockOperatorScannerRun.mockResolvedValue('./data/result.json');

      await command.run(argsWithoutOutput);

      expect(OperatorScanner).toHaveBeenCalledWith(argsWithoutOutput);
      expect(mockOperatorScannerRun).toHaveBeenCalledWith(undefined, true);
    });

    it('should handle error with complex message', async () => {
      const errorMessage = 'Failed to connect to node: timeout after 30s';
      mockOperatorScannerRun.mockRejectedValue(new Error(errorMessage));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', errorMessage);
    });
  });
});
