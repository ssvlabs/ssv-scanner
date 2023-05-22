import { ClusterScanner, NonceScanner } from 'ssv-scanner';

async function main() {
  const params = {
    nodeUrl: '',
    contractAddress: '',
    ownerAddress: '',
    operatorIds: [],
  }

  const clusterScanner = new ClusterScanner(params);
  const result = await clusterScanner.run(params.operatorIds);
  console.log(JSON.stringify({
    'block': result.payload.Block,
    'cluster snapshot': result.cluster,
    'cluster': Object.values(result.cluster)
  }, null, '  '));

  const nonceScanner = new NonceScanner(params);
  const currentNonce = await nonceScanner.run();
  console.log('Current nonce:', currentNonce);
}

void main();