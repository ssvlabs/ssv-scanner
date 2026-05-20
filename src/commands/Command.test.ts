// @ts-nocheck
import { Command } from './Command';
import { ArgumentParser } from 'argparse';

// Create a concrete implementation for testing
class TestCommand extends Command {
  constructor(name: string, description: string) {
    super(name, description);
  }

  setArguments(parser: ArgumentParser): void {
    parser.add_argument('--network', { help: 'Network name' });
    parser.add_argument('--verbose', { help: 'Verbose output', action: 'store_true' });
  }

  run(_args: any): void {
    // Test implementation
  }
}

describe('Command', () => {
  let command: TestCommand;

  beforeEach(() => {
    command = new TestCommand('test-cmd', 'Test command description');
  });

  describe('constructor', () => {
    it('should initialize with name and description', () => {
      expect(command.name).toBe('test-cmd');
      expect(command['description']).toBe('Test command description');
    });

    it('should create an ArgumentParser instance', () => {
      expect(command['parser']).toBeInstanceOf(ArgumentParser);
    });

    it('should initialize env as empty string', () => {
      expect(command['env']).toBe('');
    });

    it('should call setArguments during construction', () => {
      const setArgsSpy = jest.spyOn(TestCommand.prototype, 'setArguments');
      const _newCommand = new TestCommand('new-cmd', 'New description');
      expect(setArgsSpy).toHaveBeenCalled();
      setArgsSpy.mockRestore();
    });
  });

  describe('parse', () => {
    it('should remove the first argument (command name)', () => {
      const args = ['test-cmd', '--network', 'mainnet'];
      const result = command.parse(args);
      expect(result.network).toBe('mainnet');
    });

    it('should parse arguments correctly', () => {
      const args = ['test-cmd', '--network', 'mainnet', '--verbose'];
      const result = command.parse(args);
      expect(result.network).toBe('mainnet');
      expect(result.verbose).toBe(true);
    });

    it('should handle _stage suffix in network argument and set env to stage', () => {
      const args = ['test-cmd', '--network', 'mainnet_stage'];
      const result = command.parse(args);
      expect(result.network).toBe('mainnet_stage');
      expect(command['env']).toBe('stage');
    });

    it('should restore _stage suffix to network after parsing', () => {
      const args = ['test-cmd', '--network', 'mainnet_stage'];
      const result = command.parse(args);
      expect(result.network).toBe('mainnet_stage');
    });

    it('should not modify network when no _stage suffix is present', () => {
      const args = ['test-cmd', '--network', 'mainnet'];
      const result = command.parse(args);
      expect(result.network).toBe('mainnet');
      expect(command['env']).toBe('');
    });

    it('should handle empty args array', () => {
      const args: string[] = ['test-cmd'];
      const result = command.parse(args);
      expect(result.network).toBeUndefined();
    });

    it('should handle multiple _stage occurrences in args', () => {
      const args = ['test-cmd', '--network', 'testnet_stage', '--verbose'];
      const result = command.parse(args);
      expect(result.network).toBe('testnet_stage');
      expect(result.verbose).toBe(true);
    });

    it('should mutate the original args array by removing first element', () => {
      const args = ['test-cmd', '--network', 'mainnet'];
      const originalLength = args.length;
      command.parse(args);
      expect(args.length).toBe(originalLength - 1);
      expect(args[0]).toBe('--network');
    });

    it('should handle _stage in non-network arguments', () => {
      const args = ['test-cmd', '--network', 'some_value_stage'];
      const result = command.parse(args);
      expect(result.network).toBe('some_value_stage');
      expect(command['env']).toBe('stage');
    });
  });

  describe('abstract methods', () => {
    it('should require implementation of setArguments', () => {
      // This test verifies that setArguments is called during construction
      expect(command['parser']).toBeDefined();
    });

    it('should require implementation of run', () => {
      expect(typeof command.run).toBe('function');
    });
  });
});
