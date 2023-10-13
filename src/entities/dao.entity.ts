import { Entity, Column, PrimaryColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Dao {
  @PrimaryColumn()
  id: string = uuidv4();

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true, default: 'sample_img.png' })
  logo?: string;

  @Column()
  membersRoot: string;
}
