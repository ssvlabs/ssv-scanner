export const ContractVersion = {
  MAINNET: 'prod:v4.mainnet',
  HOLESKY: 'prod:v4.holesky',
  HOLESKY_STAGE: 'stage:v4.holesky',
  HOODI: 'prod:v4.hoodi',
  HOODI_STAGE: 'stage:v4.hoodi',
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

  let jsonViewsData;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jsonViewsData = require(`../shared/abi/${contractEnv}.${contractNetwork}.abi.json`);
  } catch (err) {
    console.error(`Failed to load JSON data from ${contractEnv}.${contractNetwork}.abi.json`, err);
    throw err;
  }

  // Check if required properties exist in jsonData
  if (
    !jsonCoreData.contractAddress ||
    !jsonCoreData.abi ||
    !jsonCoreData.genesisBlock
  ) {
    throw new Error(
      `Missing core data in JSON for ${contractEnv}.${contractNetwork}`,
    );
  }

  // Check if required properties exist in jsonData
  if (!jsonViewsData.contractAddress || !jsonViewsData.abi) {
    throw new Error(
      `Missing views data in JSON for ${contractEnv}.${contractNetwork}`,
    );
  }

  return { contractAddress: jsonViewsData.contractAddress, abi: jsonViewsData.abi, genesisBlock: jsonViewsData.genesisBlock };
}

export { getContractSettings }
