import { PublicKey } from 'paillier-bigint';
import { WitnessGenerationData } from 'src/dtos/baseProofGeneration.dto';
import { getRandomNBitNumber } from 'src/utils';

export async function generateAggregatorBaseProofWitness(
  proposalData: WitnessGenerationData,
): Promise<string> {
  try {
    const encryptionPublicKeyJson = JSON.parse(
      proposalData.encryptionPublicKeyStr,
    );
    const encryptionPublicKey = new PublicKey(
      BigInt(encryptionPublicKeyJson.n),
      BigInt(encryptionPublicKeyJson.g),
    );
    // TODO :- import env dependancy in thread
    const bitLength = parseInt(process.env.BIT_LENGTH);
    if (!bitLength)
      throw new Error('BIT_LENGTH environment variable is not defined');
    const rEncryption = getRandomNBitNumber(bitLength);

    const initVoteCount = [];
    for (let i = 0; i < 2; i++) {
      const enc = encryptionPublicKey.encrypt(1n, rEncryption);
      initVoteCount.push(enc.toString());
    }

    const witness = {
      encryptionPublicKeyStr: proposalData.encryptionPublicKeyStr,
      proposalIdStr: proposalData.proposalIdStr,
      membersRootStr: proposalData.membersRootStr,
      nonceStr: '0',
      oldVoteCountStr: initVoteCount,
      newVoteCountStr: initVoteCount,
    };

    return JSON.stringify(witness);
  } catch (error) {
    console.error('Error generating Aggregator Base Proof Witness:', error);
    throw error;
  }
}
