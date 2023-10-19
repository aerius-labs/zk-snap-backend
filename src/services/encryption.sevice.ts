import { Injectable } from '@nestjs/common';
import * as paillierBigint from 'paillier-bigint';
import { stringifyBigInt } from 'src/utils/big-int-string';
import { testnet } from 'src/utils/drand-client';
import {HttpChainClient, roundAt, timelockDecrypt, timelockEncrypt} from "tlock-js"

@Injectable()
export class EncryptionService {

    async generateEncryptedKeys(end_time: Date) {
        const keys = await this.generatePallierKeys();

        // Serialize the object to a string
        const privateString = stringifyBigInt(keys.privateKey)

        // encrypt the private key
        // add derantclient
        const client = testnet();
        const encrypted = await this.encrypt(client, privateString, end_time.getTime());

        return {
            pub_key: stringifyBigInt(keys.publicKey),
            pvt_key: encrypted,
        }
    }

    private async generatePallierKeys() {
        const bit_length = parseInt(process.env.BIT_LENGHT, 10)
        return await paillierBigint.generateRandomKeys(bit_length);
    }

    private async encrypt(client: HttpChainClient, plaintext: string, decryptionTime: number) {
        const chainInfo = await client.chain().info();
        const roundNumber = roundAt(decryptionTime, chainInfo);
        return await timelockEncrypt(roundNumber, Buffer.from(plaintext), client);
    }

    private async decrypt(client: HttpChainClient, ciphertext: string) {
        const plaintext = await timelockDecrypt(ciphertext, client);
        return {
            type: "text",
            value: plaintext.toString()
        };
    }
}