import {
  Entity,
  Column,
  ObjectIdColumn,
  PrimaryColumn,
  ObjectId,
} from 'typeorm';

@Entity()
export class Dao {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  logo: string;

  @Column()
  membersRoot: string;
}
