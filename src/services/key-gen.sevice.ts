import { Injectable } from '@nestjs/common';
import * as paillierBigint from 'paillier-bigint';
import {HttpChainClient, roundAt, timelockDecrypt, timelockEncrypt} from "tlock-js"

@Injectable()
export class KeysService {

    async generatePallierKeys() {
        const bit_length = parseInt(process.env.BIT_LENGHT, 10)
        return await paillierBigint.generateRandomKeys(bit_length);
    }

    async encrypt(client: HttpChainClient, plaintext: string, decryptionTime: number) {
        const chainInfo = await client.chain().info();
        const roundNumber = roundAt(decryptionTime, chainInfo);
        return await timelockEncrypt(roundNumber, Buffer.from(plaintext), client);
    }

    async decrypt(client: HttpChainClient, ciphertext: string) {
        const plaintext = await timelockDecrypt(ciphertext, client);
        return {
            type: "text",
            value: plaintext.toString()
        };
    }
}