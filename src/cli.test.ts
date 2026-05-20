// @ts-nocheck
import main from './cli-shared';

describe('CLI', () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    jest.restoreAllMocks();
  });

  it('should exit with error when no valid command is provided', async () => {
    process.argv = ['node', 'cli.ts'];
    await main();
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith('Command not found');
  });

  it('should recognize cluster command', async () => {
    process.argv = ['node', 'cli.ts', 'cluster'];
    await main();
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });

  it('should recognize nonce command', async () => {
    process.argv = ['node', 'cli.ts', 'nonce'];
    await main();
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });

  it('should recognize operator command', async () => {
    process.argv = ['node', 'cli.ts', 'operator'];
    await main();
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });
});
