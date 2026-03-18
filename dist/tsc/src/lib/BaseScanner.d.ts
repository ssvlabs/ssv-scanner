export interface SSVScannerParams {
    network: string;
    nodeUrl: string;
    ownerAddress: string;
}
export declare abstract class BaseScanner {
    protected DAY: number;
    protected WEEK: number;
    protected MONTH: number;
    protected SECONDS: number;
    protected MILISECONDS: number;
    protected progressBar: any;
    protected params: SSVScannerParams;
    constructor(scannerParams: SSVScannerParams);
}
