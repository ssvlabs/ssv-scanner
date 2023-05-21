export interface SSVScannerParams {
    nodeUrl: string;
    ownerAddress: string;
    contractAddress: string;
    operatorIds: number[];
}
export interface IData {
    payload: any;
    cluster: any;
}
export declare class SSVScannerCommand {
    protected DAY: number;
    protected WEEK: number;
    protected MONTH: number;
    protected progressBar: any;
    protected eventsList: string[];
    private params;
    constructor(scannerParams: SSVScannerParams);
    scan(): Promise<IData>;
    execute(): Promise<IData>;
    getClusterSnapshot(cli: boolean): Promise<IData>;
    private isValidOperatorIds;
}
