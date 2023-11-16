import { ClusterScanner, NonceScanner } from 'ssv-scanner';

async function main() {
  const params = {
    network: '',
    nodeUrl: '',
    ownerAddress: '',
    operatorIds: []
  }

  const clusterScanner = new ClusterScanner(params);
  const result = await clusterScanner.run(params.operatorIds);
  console.log(JSON.stringify({
    'block': result.payload.Block,
    'cluster snapshot': result.cluster,
    'cluster': Object.values(result.cluster)
  }, null, '  '));

  const nonceScanner = new NonceScanner(params);
  const nextNonce = await nonceScanner.run();
  console.log('Next Nonce:', nextNonce);
}

void main();