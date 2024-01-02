export class WitnessGenerationData {
  proposalIdStr: string;
  membersRootStr: string;
  encryptionPublicKeyStr: string;
  constructor(proposalId, membersRoot, encryptionPublicKey) {
    this.proposalIdStr = proposalId;
    this.membersRootStr = membersRoot;
    this.encryptionPublicKeyStr = encryptionPublicKey;
  }
}

export class WithnessToAggregator {
  proposalIdStr: string;
  witness: string;
  constructor(proposalId, witness) {
    this.proposalIdStr = proposalId;
    this.witness = witness;
  }
}
