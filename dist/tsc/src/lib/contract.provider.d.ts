export declare const ContractVersion: {
    readonly MAINNET: "prod:v4.mainnet";
    readonly HOLESKY: "prod:v4.holesky";
    readonly HOLESKY_STAGE: "stage:v4.holesky";
};
declare const getContractSettings: (networkAndEnv: string) => {
    contractAddress: any;
    abi: any;
    genesisBlock: any;
};
export { getContractSettings };
