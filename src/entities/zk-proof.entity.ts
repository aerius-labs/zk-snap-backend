import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export class ZkProof {
  @Column()
  publicInput: string[];

  @Column()
  publicOutput: string[];

  @Column()
  maxProofsVerified: 0 | 1 | 2;

  @Column()
  proof: string;
}
