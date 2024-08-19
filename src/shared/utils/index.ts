const maxBigIntAndNumber = (bigIntValue: bigint, numberValue: number) => {
  const numberAsBigInt = BigInt(numberValue);
  return bigIntValue > numberAsBigInt ? bigIntValue : numberAsBigInt;
}

const minBigInts = (val1: bigint, val2: bigint) => val1 < val2 ? val1 : val2;

export { maxBigIntAndNumber, minBigInts };
