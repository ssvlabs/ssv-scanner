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

export class ContractProvider {
  private contract: ContractData;
  public web3: Web3;

  constructor(contractEnv: string, contractGroup: string, nodeUrl: string) {

    let [version, network] = contractGroup.split('.');
    version = version.toUpperCase();
    network = network.toUpperCase();

    let jsonCoreData;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      jsonCoreData = require(`../shared/abi/${contractEnv}.${contractGroup}.abi.json`);
    } catch (err) {
      console.error(
        `Failed to load JSON data from ${contractEnv}.${contractGroup}.abi.json`,
        err,
      );
      throw err;
    }

    let jsonViewsData;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      jsonViewsData = require(`../shared/abi/${contractEnv}.${contractGroup}.views.abi.json`);
    } catch (err) {
      console.error(
        `Failed to load JSON data from ${contractEnv}.${contractGroup}.views.abi.json`,
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
        `Missing core data in JSON for ${contractEnv}.${contractGroup}`,
      );
    }

    // Check if required properties exist in jsonData
    if (!jsonViewsData.contractAddress || !jsonViewsData.abi) {
      throw new Error(
        `Missing views data in JSON for ${contractEnv}.${contractGroup}`,
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
