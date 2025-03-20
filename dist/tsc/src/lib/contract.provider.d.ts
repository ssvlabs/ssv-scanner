export declare const ContractVersion: {
    readonly MAINNET: "prod:v4.mainnet";
    readonly HOLESKY: "prod:v4.holesky";
    readonly HOLESKY_STAGE: "stage:v4.holesky";
    readonly HOODI: "prod:v4.hoodi";
    readonly HOODI_STAGE: "stage:v4.hoodi";
};
declare const getContractSettings: (networkAndEnv: string) => {
    contractAddress: any;
    abi: any;
    genesisBlock: any;
};
export { getContractSettings };
