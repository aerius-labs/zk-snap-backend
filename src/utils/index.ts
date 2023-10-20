export const isKeccakHash = (hash: string) => {
  const keccak256Length = 66; // A keccak256 hash with '0x' prepended is 66 characters long
  const hexPattern = /^[a-fA-F0-9]+$/; // Regular expression to match hexadecimal characters

  // Check the length of the string
  if (hash.length !== keccak256Length) {
    return false;
  }

  // Check if the string starts with '0x'
  if (!hash.startsWith('0x')) {
    return false;
  }

  // Remove the '0x' prefix for the hexadecimal character check
  const hashWithoutPrefix = hash.slice(2);

  // Check if the string contains only valid hexadecimal characters
  if (!hexPattern.test(hashWithoutPrefix)) {
    return false;
  }

  return true;
};

export const getRandomNBitNumber = (bits: number) => {
  let randomBigInt = BigInt(0);
  for (let i = 0; i < bits; i++) {
    randomBigInt |= BigInt(Math.floor(Math.random() * 2)) << BigInt(i);
  }
  return randomBigInt;
};
