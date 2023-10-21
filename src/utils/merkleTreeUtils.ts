import { MerkleTree } from 'merkletreejs';
import * as sha256 from 'sha256';

export interface MerkleProof {
  merkleRoot: string;
  proof: string[];
  leaf: string;
}

/**
 * Function to create a Merkle Tree and return the root.
 * @param leaves - An array of leaves (data) to build the Merkle Tree.
 * @returns The Merkle Root as a hexadecimal string.
 */
export function createMerkleRoot(leaves: string[]): string {
  // Convert leaves to Buffer and hash them
  const hashedLeaves = leaves.map((leaf) => Buffer.from(sha256(leaf), 'hex'));

  // Create a Merkle Tree using sha256 as the hash function
  const tree = new MerkleTree(hashedLeaves, sha256, { sortPairs: true });

  // Return the Merkle Root as a hexadecimal string
  return tree.getRoot().toString('hex');
}

/**
 * Function to create a Merkle Proof for a particular leaf.
 * @param leaves - An array of leaves (data) to build the Merkle Tree.
 * @param index - The index of the leaf to prove.
 * @returns The Merkle Proof object.
 */
export function createMerkleProof(
  leaves: string[],
  index: number,
): MerkleProof {
  // Convert leaves to Buffer and hash them
  const hashedLeaves = leaves.map((leaf) => Buffer.from(sha256(leaf), 'hex'));

  // Create a Merkle Tree using sha256 as the hash function
  const tree = new MerkleTree(hashedLeaves, sha256, { sortPairs: true });

  // Get the Merkle Proof for the specified leaf
  const proof = tree.getProof(hashedLeaves[index]);

  // Convert proof to a format that can be easily sent as a JSON response
  const formattedProof = proof.map((p) => p.data.toString('hex'));

  return {
    merkleRoot: tree.getRoot().toString('hex'),
    proof: formattedProof,
    leaf: hashedLeaves[index].toString('hex'),
  };
}
