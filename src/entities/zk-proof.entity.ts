import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class ZkProof {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  id: string;

  @Column()
  proposalId: string;

  @Column()
  type: 'user' | 'base' | 'recursive';

  @Column()
  publicInput: string[];

  @Column()
  publicOutput: string[];

  @Column()
  maxProofsVerified: 0 | 1 | 2;

  @Column()
  proof: string;
}
