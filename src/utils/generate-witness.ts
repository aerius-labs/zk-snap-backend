import { PublicKey } from 'paillier-bigint';
import { WitnessGenerationData } from 'src/dtos/baseProofGeneration.dto';
import { getRandomNBitNumber } from 'src/utils';
import { ZkProof } from 'src/entities/zk-proof.entity';
import * as paillierBigint from 'paillier-bigint';


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

export async function aggregateVote(
  proposalData: WitnessGenerationData,
  userProof: ZkProof,
  earlierProof: ZkProof,
): Promise<string> {
  try {
    const witness: any = {};
    witness.encryptionPublicKeyStr = proposalData.encryptionPublicKeyStr;
    witness.proposalIdStr = proposalData.proposalIdStr;
    witness.membersRootStr = proposalData.membersRootStr;
    witness.nonceStr = '0';
    witness.oldVoteCountStr = [
      earlierProof.publicInput[earlierProof.publicInput.length - 2],
      earlierProof.publicInput[earlierProof.publicInput.length - 1],
    ];

    witness.newVoteCountStr = [];
    for (let i = 0; i < 2; i++) {
      witness.newVoteCountStr.push(
        await addCipherTexts(
          proposalData.encryptionPublicKeyStr,
          userProof.publicInput[userProof.publicInput.length - 2 + i],
          witness.oldVoteCountStr[i],
        ),
      );
    }

    return JSON.stringify(witness);
  } catch (error) {
    console.error('Error generating Aggregate vote Witness:', error);
    throw error;
  }
}

async function addCipherTexts(pubKey: string, c1: string, c2: string) {
  const pubJson = JSON.parse(pubKey);
  const pub = new paillierBigint.PublicKey(
    BigInt(pubJson.n),
    BigInt(pubJson.g),
  );

  const c = pub.addition(...[BigInt(c1), BigInt(c2)]);
  return c.toString();
}