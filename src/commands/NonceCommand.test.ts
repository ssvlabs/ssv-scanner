// @ts-nocheck
jest.mock('../lib/NonceScanner/NonceScanner', () => {
  return {
    NonceScanner: jest.fn().mockImplementation(() => ({
      run: jest.fn(),
    })),
  };
});

import { NonceCommand } from './NonceCommand';
import { NonceScanner } from '../lib/NonceScanner/NonceScanner';

describe('NonceCommand', () => {
  let command: NonceCommand;
  let mockNonceScannerRun: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockNonceScannerRun = jest.fn();
    (NonceScanner as jest.Mock).mockImplementation(() => ({
      run: mockNonceScannerRun,
    }));

    command = new NonceCommand();
  });

  describe('constructor', () => {
    it('should initialize with correct name and description', () => {
      expect(command.name).toBe('nonce');
      expect(command['description']).toBe('Handles nonce operations');
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
    });

    it('should require network argument', () => {
      const parser = command['parser'];
      const networkAction = parser._actions.find((a: any) => a.dest === 'network');

      expect(networkAction).toBeDefined();
      expect(networkAction.required).toBe(true);
      expect(networkAction.choices).toEqual(['mainnet', 'hoodi', 'local_testnet', 'fusaka']);
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
  });

  describe('run', () => {
    const validArgs = {
      network: 'mainnet',
      nodeUrl: 'https://example.com',
      ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
    };

    it('should create NonceScanner with provided args', async () => {
      mockNonceScannerRun.mockResolvedValue(1);

      await command.run(validArgs);

      expect(NonceScanner).toHaveBeenCalledWith(validArgs);
    });

    it('should call nonceScanner.run with isCli=true', async () => {
      mockNonceScannerRun.mockResolvedValue(5);

      await command.run(validArgs);

      expect(mockNonceScannerRun).toHaveBeenCalledWith(true);
    });

    it('should log the result with correct format', async () => {
      mockNonceScannerRun.mockResolvedValue(42);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith('Next Nonce:', 42);
    });

    it('should log error when NonceScanner.run throws', async () => {
      const errorMessage = 'Network error';
      mockNonceScannerRun.mockRejectedValue(new Error(errorMessage));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', errorMessage);
    });

    it('should handle NonceScanner.run returning zero', async () => {
      mockNonceScannerRun.mockResolvedValue(0);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith('Next Nonce:', 0);
    });

    it('should handle NonceScanner.run returning large numbers', async () => {
      mockNonceScannerRun.mockResolvedValue(999999);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith('Next Nonce:', 999999);
    });

    it('should handle error with empty message', async () => {
      mockNonceScannerRun.mockRejectedValue(new Error(''));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', '');
    });

    it('should handle error with complex message', async () => {
      const errorMessage = 'Failed to connect to node: timeout after 30s';
      mockNonceScannerRun.mockRejectedValue(new Error(errorMessage));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', errorMessage);
    });
  });
});
