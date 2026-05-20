/// <reference types="jest" />

// Mock figlet
jest.mock('figlet', () => {
  return jest.fn((_message: string, callback: (error: any, output?: string) => void) => {
    callback(null, 'Mocked Figlet Output');
  });
});

// Mock the commands
jest.mock('./commands/NonceCommand');
jest.mock('./commands/ClusterCommand');
jest.mock('./commands/OperatorCommand');

import cliShared from './cli-shared';
import { NonceCommand } from './commands/NonceCommand';
import { ClusterCommand } from './commands/ClusterCommand';
import { OperatorCommand } from './commands/OperatorCommand';

// Mock process.exit
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(((code: number) => {
  throw new Error(`process.exit called with code ${code}`);
}) as any);

describe('cli-shared', () => {
  let mockNonceCommand: jest.Mocked<NonceCommand>;
  let mockClusterCommand: jest.Mocked<ClusterCommand>;
  let mockOperatorCommand: jest.Mocked<OperatorCommand>;

  const originalArgv = process.argv;

  beforeEach(() => {
    // Setup mock command instances
    mockNonceCommand = {
      name: 'nonce',
      setArguments: jest.fn(),
      run: jest.fn().mockResolvedValue(undefined),
      parse: jest.fn().mockReturnValue({ network: 'mainnet', nodeUrl: 'http://localhost:8545', ownerAddress: '0x123' }),
    } as unknown as jest.Mocked<NonceCommand>;

    mockClusterCommand = {
      name: 'cluster',
      setArguments: jest.fn(),
      run: jest.fn().mockResolvedValue(undefined),
      parse: jest.fn().mockReturnValue({ network: 'mainnet', nodeUrl: 'http://localhost:8545', ownerAddress: '0x123', operatorIds: '1,2,3' }),
    } as unknown as jest.Mocked<ClusterCommand>;

    mockOperatorCommand = {
      name: 'operator',
      setArguments: jest.fn(),
      run: jest.fn().mockResolvedValue(undefined),
      parse: jest.fn().mockReturnValue({ network: 'mainnet', nodeUrl: 'http://localhost:8545', ownerAddress: '0x123' }),
    } as unknown as jest.Mocked<OperatorCommand>;

    (NonceCommand as jest.Mock).mockClear();
    (ClusterCommand as jest.Mock).mockClear();
    (OperatorCommand as jest.Mock).mockClear();

    (NonceCommand as jest.Mock).mockImplementation(() => mockNonceCommand);
    (ClusterCommand as jest.Mock).mockImplementation(() => mockClusterCommand);
    (OperatorCommand as jest.Mock).mockImplementation(() => mockOperatorCommand);

    // Reset argv
    process.argv = ['node', 'script.js'];
  });

  afterEach(() => {
    process.argv = originalArgv;
    jest.clearAllMocks();
  });

  describe('FigletMessage', () => {
    it('should resolve with figlet output on success', async () => {
      const figlet = require('figlet');
      figlet.mockImplementation((_message: string, callback: (error: any, output?: string) => void) => {
        callback(null, 'Test Output');
      });

      process.argv = ['node', 'script.js', 'nonce', '--help'];

      const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(cliShared()).rejects.toThrow('process.exit called with code 0');
      expect(mockLog).toHaveBeenCalled();

      mockLog.mockRestore();
    });

    it('should resolve with empty string on figlet error', async () => {
      const figlet = require('figlet');
      figlet.mockImplementation((_message: string, callback: (error: any, output?: string) => void) => {
        callback(new Error('figlet error'), undefined);
      });

      process.argv = ['node', 'script.js', 'nonce', '--help'];

      await expect(cliShared()).rejects.toThrow('process.exit called with code 0');
    });
  });

  describe('main function', () => {
    describe('help flag handling', () => {
      it('should call setArguments on all commands when --help is provided with nonce', async () => {
        process.argv = ['node', 'script.js', 'nonce', '--help'];

        await expect(cliShared()).rejects.toThrow('process.exit called with code 0');

        expect(mockNonceCommand.setArguments).toHaveBeenCalled();
        expect(mockClusterCommand.setArguments).toHaveBeenCalled();
        expect(mockOperatorCommand.setArguments).toHaveBeenCalled();
      });

      it('should call setArguments on all commands when --help is provided with cluster', async () => {
        process.argv = ['node', 'script.js', 'cluster', '--help'];

        await expect(cliShared()).rejects.toThrow('process.exit called with code 0');

        expect(mockNonceCommand.setArguments).toHaveBeenCalled();
        expect(mockClusterCommand.setArguments).toHaveBeenCalled();
        expect(mockOperatorCommand.setArguments).toHaveBeenCalled();
      });

      it('should call setArguments on all commands when --help is provided with operator', async () => {
        process.argv = ['node', 'script.js', 'operator', '--help'];

        await expect(cliShared()).rejects.toThrow('process.exit called with code 0');

        expect(mockNonceCommand.setArguments).toHaveBeenCalled();
        expect(mockClusterCommand.setArguments).toHaveBeenCalled();
        expect(mockOperatorCommand.setArguments).toHaveBeenCalled();
      });
    });

    describe('command routing', () => {
      it('should run nonce command when nonce is specified', async () => {
        process.argv = ['node', 'script.js', 'nonce', '-nw', 'mainnet', '-n', 'http://localhost:8545', '-oa', '0x123'];

        await cliShared();

        expect(mockNonceCommand.run).toHaveBeenCalled();
        expect(mockClusterCommand.run).not.toHaveBeenCalled();
        expect(mockOperatorCommand.run).not.toHaveBeenCalled();
      });

      it('should run cluster command when cluster is specified', async () => {
        process.argv = ['node', 'script.js', 'cluster', '-nw', 'mainnet', '-n', 'http://localhost:8545', '-oa', '0x123', '-oids', '1,2,3'];

        await cliShared();

        expect(mockClusterCommand.run).toHaveBeenCalled();
        expect(mockNonceCommand.run).not.toHaveBeenCalled();
        expect(mockOperatorCommand.run).not.toHaveBeenCalled();
      });

      it('should run operator command when operator is specified', async () => {
        process.argv = ['node', 'script.js', 'operator', '-nw', 'mainnet', '-n', 'http://localhost:8545', '-oa', '0x123'];

        await cliShared();

        expect(mockOperatorCommand.run).toHaveBeenCalled();
        expect(mockNonceCommand.run).not.toHaveBeenCalled();
        expect(mockClusterCommand.run).not.toHaveBeenCalled();
      });
    });

    describe('unknown command handling', () => {
      it('should exit with code 2 for unknown command (argparse handles it)', async () => {
        process.argv = ['node', 'script.js', 'unknown'];

        // argparse handles unknown commands and exits with code 2
        await expect(cliShared()).rejects.toThrow('process.exit called with code 2');
      });

      it('should print "Command not found" and exit with code 1 when no command is provided', async () => {
        process.argv = ['node', 'script.js'];

        const mockErr = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(cliShared()).rejects.toThrow('process.exit called with code 1');

        expect(mockErr).toHaveBeenCalledWith('Command not found');
        expect(mockProcessExit).toHaveBeenCalledWith(1);

        mockErr.mockRestore();
      });
    });

    describe('console output', () => {
      it('should print banner with version and description', async () => {
        const figlet = require('figlet');
        figlet.mockImplementation((_message: string, callback: (error: any, output?: string) => void) => {
          callback(null, 'Mocked Figlet Output');
        });

        process.argv = ['node', 'script.js', 'nonce', '--help'];

        const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

        await expect(cliShared()).rejects.toThrow('process.exit called with code 0');

        // Verify that console.log was called (banner output is printed)
        expect(mockLog).toHaveBeenCalled();

        mockLog.mockRestore();
      });
    });

    describe('command instantiation', () => {
      it('should create instances of all three commands', async () => {
        process.argv = ['node', 'script.js', 'nonce', '--help'];

        await expect(cliShared()).rejects.toThrow('process.exit called with code 0');

        expect(NonceCommand).toHaveBeenCalled();
        expect(ClusterCommand).toHaveBeenCalled();
        expect(OperatorCommand).toHaveBeenCalled();
      });
    });
  });
});
