type BigIntObject = {
  [key: string]: BigInt | BigIntObject | any;
};

export function stringifyBigInt(obj: BigIntObject): string {
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
}

export function parseBigInt(jsonString: string): any {
  return JSON.parse(jsonString, (_, value) => {
    if (typeof value === 'string') {
      return BigInt(value);
    }
    return value;
  });
}
