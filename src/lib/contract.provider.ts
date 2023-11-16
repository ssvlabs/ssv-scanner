import Web3 from 'web3';

export type NetworkName = string;
export type ContractAddress = string;
export type ContractData = {
  version: string;
  network: string;
  address: ContractAddress;
  addressViews: ContractAddress;
  tokenAddress: string;
  abi: Record<string, any>;
  abiViews: Record<string, any>;
  genesisBlock: number;
};

export const ContractVersion = {
  MAINNET: 'prod:v4.mainnet',
  PRATER: 'prod:v4.prater',
  HOLESKY: 'prod:v4.holesky',
  PRATER_STAGE: 'stage:v4.prater',
  HOLESKY_STAGE: 'stage:v4.holesky',
} as const;

export class ContractProvider {
  private contract: ContractData;
  public web3: Web3;

  constructor(networkInfo: string, nodeUrl: string) {

    const [contractEnv, contractNetwork] = ContractVersion[networkInfo.toUpperCase() as keyof typeof ContractVersion].split(':');
    let [version, network] = contractNetwork.split('.');
    version = version.toUpperCase();
    network = network.toUpperCase();

    let jsonCoreData;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      jsonCoreData = require(`../shared/abi/${contractEnv}.${contractNetwork}.abi.json`);
    } catch (err) {
      console.error(
        `Failed to load JSON data from ${contractEnv}.${contractNetwork}.abi.json`,
        err,
      );
      throw err;
    }

    let jsonViewsData;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      jsonViewsData = require(`../shared/abi/${contractEnv}.${contractNetwork}.views.abi.json`);
    } catch (err) {
      console.error(
        `Failed to load JSON data from ${contractEnv}.${contractNetwork}.views.abi.json`,
        err,
      );
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

    this.contract = <ContractData>{
      version,
      network,
      address: jsonCoreData.contractAddress,
      addressViews: jsonViewsData.contractAddress,
      abi: jsonCoreData.abi,
      abiViews: jsonViewsData.abi,
      genesisBlock: jsonCoreData.genesisBlock,
    };

    this.web3 = new Web3(nodeUrl);
  }

  get contractAddress(): string {
    return this.contract.address
  }

  get abiCore() {
    return this.contract.abi as any;
  }

  get abiViews() {
    return this.contract.abiViews as any;
  }

  get contractCore() {
    return new this.web3.eth.Contract(this.abiCore, this.contract.address);
  }

  get contractViews() {
    return new this.web3.eth.Contract(
      this.abiViews,
      this.contract.addressViews,
    );
  }

  get genesisBlock() {
    return this.contract.genesisBlock;
  }
}
