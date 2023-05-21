import { BaseScanner } from '../BaseScanner';
export interface IData {
    payload: any;
    cluster: any;
}
export declare class ClusterScanner extends BaseScanner {
    protected eventsList: string[];
    run(operatorIds: number[], cli?: boolean): Promise<IData>;
    private _getClusterSnapshot;
    private _isValidOperatorIds;
}
