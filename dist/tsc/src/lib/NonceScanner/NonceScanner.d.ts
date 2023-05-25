import { BaseScanner } from '../BaseScanner';
export declare class NonceScanner extends BaseScanner {
    protected eventsList: string[];
    run(cli?: boolean): Promise<number>;
    private _getLatestNonce;
}
