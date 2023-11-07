import { Column } from 'typeorm';

export class EncryptionKeyPair {
  @Column()
  public_key: string;

  @Column()
  private_key: string;
}
