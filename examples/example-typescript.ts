import { SSVScannerCommand } from '../src/main';

async function main() {
  const params = {
    nodeUrl: '',
    contractAddress: '',
    ownerAddress: '',
    operatorIds: [],
  }
  const command = new SSVScannerCommand(params);
  const result = await command.scan()
  console.log(JSON.stringify({
    "block": result.payload.Block,
    "cluster snapshot": result.cluster,
    "cluster": Object.values(result.cluster)
  }, null, '  '));
}

void main();