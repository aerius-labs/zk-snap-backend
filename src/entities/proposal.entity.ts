import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ObjectIdColumn,
    ObjectId,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { EncryptionKeyPair } from './EncryptionKeyPair.entity';
  
  @Entity('proposals')
  export class Proposal {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    id: string;

    @Column()
    creator: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;

    @Column()
    dao_id: string;
  
    @Column('timestamp')
    start_time: Date;
  
    @Column('timestamp')
    end_time: Date;
  
    @Column('simple-array')
    voting_options: string[];
  
    @OneToOne(() => EncryptionKeyPair, keyPair => keyPair.proposal, { cascade: true, eager: true })
    @JoinColumn()
    encryption_key_pair: EncryptionKeyPair;
  
    @Column({ type: 'enum', enum: ['NOT_STARTED', 'ON_GOING', 'FINISHED'], default: 'NOT_STARTED' })
    status: 'NOT_STARTED' | 'ON_GOING' | 'FINISHED';
  
    @Column('simple-array')
    result: number[];
  }
  
  