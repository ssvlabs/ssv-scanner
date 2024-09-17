import { BaseScanner } from '../BaseScanner';
export interface IData {
    payload: any;
    cluster: any;
}
export declare class ClusterScanner extends BaseScanner {
    run(operatorIds: number[], isCli?: boolean): Promise<IData>;
    private _getClusterSnapshot;
    private _isValidOperatorIds;
}
