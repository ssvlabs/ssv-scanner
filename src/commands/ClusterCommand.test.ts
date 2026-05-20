// @ts-nocheck
jest.mock('../lib/ClusterScanner/ClusterScanner', () => {
  return {
    ClusterScanner: jest.fn().mockImplementation(() => ({
      run: jest.fn(),
    })),
  };
});

import { ClusterCommand } from './ClusterCommand';
import { ClusterScanner } from '../lib/ClusterScanner/ClusterScanner';

describe('ClusterCommand', () => {
  let command: ClusterCommand;
  let mockClusterScannerRun: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'table').mockImplementation(() => {});

    mockClusterScannerRun = jest.fn();
    (ClusterScanner as jest.Mock).mockImplementation(() => ({
      run: mockClusterScannerRun,
    }));

    command = new ClusterCommand();
  });

  describe('constructor', () => {
    it('should initialize with correct name and description', () => {
      expect(command.name).toBe('cluster');
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
      expect(argNames).toContain('operatorIds');
    });

    it('should require network argument with correct choices', () => {
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

    it('should require operatorIds argument', () => {
      const parser = command['parser'];
      const operatorIdsAction = parser._actions.find((a: any) => a.dest === 'operatorIds');

      expect(operatorIdsAction).toBeDefined();
      expect(operatorIdsAction.required).toBe(true);
    });
  });

  describe('run', () => {
    const validArgs = {
      network: 'mainnet',
      nodeUrl: 'https://example.com',
      ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
      operatorIds: '4,2,3,1',
    };

    const mockResult = {
      payload: {
        'Owner': '0x1234567890abcdef1234567890abcdef12345678',
        'Operators': '1,2,3,4',
        'Block': 1000,
        'Data': '1,0,0,true,0',
      },
      cluster: {
        validatorCount: 1,
        networkFeeIndex: '0',
        index: '0',
        active: true,
        balance: '0',
      },
    };

    it('should create ClusterScanner with provided args', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run(validArgs);

      expect(ClusterScanner).toHaveBeenCalledWith(validArgs);
    });

    it('should call clusterScanner.run with sorted operatorIds and isCli=true', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run(validArgs);

      expect(mockClusterScannerRun).toHaveBeenCalledWith([1, 2, 3, 4], true);
    });

    it('should log result payload and cluster with console.table', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run(validArgs);

      expect(console.table).toHaveBeenCalledWith(mockResult.payload);
      expect(console.table).toHaveBeenCalledWith(mockResult.cluster);
    });

    it('should log "Cluster snapshot:" message', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith('Cluster snapshot:');
    });

    it('should log JSON stringified result', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"block"')
      );
    });

    it('should log error when ClusterScanner.run throws', async () => {
      const errorMessage = 'Network error';
      mockClusterScannerRun.mockRejectedValue(new Error(errorMessage));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', errorMessage);
    });

    it('should sort operatorIds numerically before passing to scanner', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run({ ...validArgs, operatorIds: '10,2,5,1' });

      expect(mockClusterScannerRun).toHaveBeenCalledWith([1, 2, 5, 10], true);
    });

    it('should handle single operator id', async () => {
      mockClusterScannerRun.mockResolvedValue(mockResult);

      await command.run({ ...validArgs, operatorIds: '5' });

      expect(ClusterScanner).toHaveBeenCalledWith({ ...validArgs, operatorIds: '5' });
      expect(mockClusterScannerRun).toHaveBeenCalledWith([5], true);
    });

    it('should throw error when operatorIds contains non-numeric value', async () => {
      await command.run({ ...validArgs, operatorIds: '1,abc,3,4' });

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', 'Operator Id should be the number');
    });

    it('should handle error with complex message', async () => {
      const errorMessage = 'Failed to connect to node: timeout after 30s';
      mockClusterScannerRun.mockRejectedValue(new Error(errorMessage));

      await command.run(validArgs);

      expect(console.error).toHaveBeenCalledWith('\x1b[31m', errorMessage);
    });

    it('should handle bigint values in JSON.stringify by converting to string', async () => {
      const resultWithBigInt = {
        payload: {
          'Owner': '0x1234567890abcdef1234567890abcdef12345678',
          'Operators': '1,2,3,4',
          'Block': 1000,
          'Data': '1,0,0,true,0',
        },
        cluster: {
          validatorCount: 1,
          networkFeeIndex: BigInt(123456789),
          index: BigInt(0),
          active: true,
          balance: BigInt(999999),
        },
      };
      mockClusterScannerRun.mockResolvedValue(resultWithBigInt);

      await command.run(validArgs);

      expect(console.log).toHaveBeenCalledWith(
        expect.not.stringContaining('BigInt')
      );
    });
  });
});
