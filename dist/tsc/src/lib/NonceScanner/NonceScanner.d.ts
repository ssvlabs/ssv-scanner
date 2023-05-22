import { BaseScanner } from '../BaseScanner';
export declare class NonceScanner extends BaseScanner {
    run(cli?: boolean): Promise<number>;
    private _getLatestNonce;
}
