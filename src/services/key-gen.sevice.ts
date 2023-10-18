import { Injectable } from '@nestjs/common';
import * as paillierBigint from 'paillier-bigint';
import {HttpChainClient, roundAt, timelockDecrypt, timelockEncrypt} from "tlock-js"
import { vulnerabilityDecryptionSchema } from 'src/constants/tle-const';

@Injectable()
export class KeysService {

    async generatePallierKeys() {
        return await paillierBigint.generateRandomKeys(63);
    }

    async encrypt(client: HttpChainClient, plaintext: string, decryptionTime: number) {
        const chainInfo = await client.chain().info();
        const roundNumber = roundAt(decryptionTime, chainInfo);
        return await timelockEncrypt(roundNumber, Buffer.from(plaintext), client);
    }

    async decryptMulti(client: HttpChainClient, ciphertext: string) {
        const plaintext = await timelockDecrypt(ciphertext, client);
        
        if (await vulnerabilityDecryptionSchema.isValid(plaintext)) {
            const vulnReport = await vulnerabilityDecryptionSchema.validate(plaintext);

            let file: File | undefined = undefined
            if (vulnReport.file) {
                const fileBuffer = Buffer.from(vulnReport.file.content, "base64")
                file = new File([fileBuffer], vulnReport.file.name)
            }

            return {
                type: "vulnerability_report",
                value: {
                    title: vulnReport.title,
                    description: vulnReport.description,
                    cve: vulnReport.cve ?? undefined,
                    file
                }
            };
        }

        return {
            type: "text",
            value: plaintext.toString()
        };
    }
}