export interface SSVScannerParams {
    ssvSyncEnv: string;
    ssvSyncGroup: string;
    nodeUrl: string;
    ownerAddress: string;
    contractAddress: string;
}
export declare abstract class BaseScanner {
    protected DAY: number;
    protected WEEK: number;
    protected MONTH: number;
    protected progressBar: any;
    protected params: SSVScannerParams;
    constructor(scannerParams: SSVScannerParams);
}
