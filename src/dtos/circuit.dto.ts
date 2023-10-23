export interface AggregatorBaseProofInputs {
  encryptionPublicKeyStr: string;
  proposalIdStr: string;
  membersRootStr: string;
  nonceStr: string;
  oldVoteCountStr: string[];
  newVoteCountStr: string[];
}

export interface AggregatorProofInputs extends AggregatorBaseProofInputs {
  selfProofStr: string;
  userProofStr: string;
}
