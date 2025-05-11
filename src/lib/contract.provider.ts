export const ContractVersion = {
  MAINNET: 'prod:v4.mainnet',
  HOODI: 'prod:v4.hoodi',
  HOODI_STAGE: 'stage:v4.hoodi',
  LOCAL_TESTNET: 'local:v4.testnet',
} as const;

const getContractSettings = (networkAndEnv: string) => {
  const [contractEnv, contractNetwork] = ContractVersion[networkAndEnv.toUpperCase() as keyof typeof ContractVersion].split(':');

  let jsonCoreData;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jsonCoreData = require(`../shared/abi/${contractEnv}.${contractNetwork}.abi.json`);
  } catch (err) {
    console.error(`Failed to load JSON data from ${contractEnv}.${contractNetwork}.abi.json`, err);
    throw err;
  }

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

  return { contractAddress: jsonCoreData.contractAddress, abi: jsonCoreData.abi, genesisBlock: jsonCoreData.genesisBlock };
}

export { getContractSettings }
