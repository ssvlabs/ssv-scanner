export const ContractVersion = {
  MAINNET: 'prod:v4.mainnet',
  HOODI: 'prod:v4.hoodi',
  HOODI_STAGE: 'stage:v4.hoodi',
  LOCAL_TESTNET: 'local:v4.testnet',
  FUSAKA_STAGE: 'stage:v4.fusaka',
} as const;

const getContractSettings = (networkAndEnv: string) => {
  const versionKey = networkAndEnv.toUpperCase() as keyof typeof ContractVersion;
  const version = ContractVersion[versionKey];
  if (!version) {
    throw new Error(
      `Unknown network: ${networkAndEnv}. Expected one of: ${Object.keys(ContractVersion).join(', ')}`,
    );
  }
  const [contractEnv, contractNetwork] = version.split(':');

  const configFileName = `${contractEnv}.${contractNetwork}.abi.json`;

  let jsonCoreData;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jsonCoreData = require(`../shared/abi/${configFileName}`);
  } catch (err) {
    console.error(`Failed to load JSON data from ${configFileName}`, err);
    throw err;
  }

  // One-time log per invocation so executor logs show which config was used.
  console.log('[scanner] contract config file:', configFileName);

  // Check if required properties exist in jsonData
  if (
    !jsonCoreData.contractAddress ||
    !jsonCoreData.abi ||
    (!jsonCoreData.genesisBlock && jsonCoreData.genesisBlock !== 0)
  ) {
    throw new Error(
      `Missing core data in JSON for ${contractEnv}.${contractNetwork}`,
    );
  }

  const abi = jsonCoreData.abi;
  if (Array.isArray(abi)) {
    const eventNames = abi
      .filter((x: any) => x && x.type === 'event')
      .map((x: any) => x.name)
      .filter((name: any) => typeof name === 'string');
    console.log('[scanner] ABI event names:', eventNames.join(', '));
    console.log(
      '[scanner] ABI has ClusterBalanceUpdated:',
      eventNames.includes('ClusterBalanceUpdated'),
    );
  }

  return {
    contractAddress: jsonCoreData.contractAddress,
    abi,
    genesisBlock: jsonCoreData.genesisBlock,
  };
}

export { getContractSettings }
