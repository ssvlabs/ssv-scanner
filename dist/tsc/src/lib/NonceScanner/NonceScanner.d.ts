import { BaseScanner } from '../BaseScanner';
export declare class NonceScanner extends BaseScanner {
    run(isCli?: boolean): Promise<number>;
    _getValidatorAddedEventCount(isCli?: boolean): Promise<number>;
}
