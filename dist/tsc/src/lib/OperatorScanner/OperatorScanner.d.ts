import { BaseScanner } from '../BaseScanner';
export declare class OperatorScanner extends BaseScanner {
    run(outputPath?: string, isCli?: boolean): Promise<string>;
    _getOperatorPubkeys(outputPath?: string, isCli?: boolean): Promise<string>;
}
