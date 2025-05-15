export declare const ContractVersion: {
    readonly MAINNET: "prod:v4.mainnet";
    readonly HOODI: "prod:v4.hoodi";
    readonly HOODI_STAGE: "stage:v4.hoodi";
    readonly LOCAL_TESTNET: "local:v4.testnet";
};
declare const getContractSettings: (networkAndEnv: string) => {
    contractAddress: any;
    abi: any;
    genesisBlock: any;
};
export { getContractSettings };
