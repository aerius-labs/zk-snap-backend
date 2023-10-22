import { MerkleTree, Poseidon, PublicKey, MerkleWitness } from 'o1js';

export interface MerkleProof {
  merkleRoot: string;
  proof: MyMerkleWitness;
  leaf: string;
}

class MyMerkleWitness extends MerkleWitness(8) {}

/**
 * Function to create a Merkle Tree and return the root.
 * @param leaves - An array of leaves (data) to build the Merkle Tree.
 * @returns The Merkle Root as a hexadecimal string.
 */
export function createMerkleRoot(leaves: string[]): MerkleTree {
  // Convert leaves to Buffer and hash them
  const merkleTree = new MerkleTree(8);
  // Set the leaves in the Merkle Tree
  leaves.forEach((leaf, index) => {
    const pubKey = PublicKey.fromBase58(leaf).x;
    merkleTree.setLeaf(BigInt(index), Poseidon.hash([pubKey]));
  });
  return merkleTree;
}

/**
 * Function to create a Merkle Proof for a particular leaf.
 * @param leaves - An array of leaves (data) to build the Merkle Tree.
 * @param index - The index of the leaf to prove.
 * @returns The Merkle Proof object.
 */
export function createMerkleProof(
  members: string[],
  index: number,
): MyMerkleWitness {

    const merkleTree = new MerkleTree(8);
  // Set the leaves in the Merkle Tree
  members.forEach((leaf, index) => {
    const pubKey = PublicKey.fromBase58(leaf).x;
    merkleTree.setLeaf(BigInt(index), Poseidon.hash([pubKey]));
  });
  const merkleWitness = merkleTree.getWitness(BigInt(index));
  const merkleProof = new MyMerkleWitness(merkleWitness);

  return merkleProof;
}
