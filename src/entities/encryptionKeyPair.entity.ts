import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ObjectIdColumn,
    ObjectId
  } from 'typeorm';
  import { Proposal } from './Proposal.entity';
  
  @Entity('encryption_key_pairs')
  export class EncryptionKeyPair {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    public_key: string; 
  
    @Column()
    private_key: string;
    
    @OneToOne(() => Proposal, proposal => proposal.encryption_key_pair)
    proposal: Proposal;
  }
  