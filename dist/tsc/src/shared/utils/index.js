"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minBigInts = exports.maxBigIntAndNumber = void 0;
const maxBigIntAndNumber = (bigIntValue, numberValue) => {
    const numberAsBigInt = BigInt(numberValue);
    return bigIntValue > numberAsBigInt ? bigIntValue : numberAsBigInt;
};
exports.maxBigIntAndNumber = maxBigIntAndNumber;
const minBigInts = (val1, val2) => val1 < val2 ? val1 : val2;
exports.minBigInts = minBigInts;
//# sourceMappingURL=index.js.map