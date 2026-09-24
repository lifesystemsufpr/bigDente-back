import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt } from 'node:crypto';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await this.deriveKey(password, salt);

    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  private deriveKey(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, 64, (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      });
    });
  }
}
