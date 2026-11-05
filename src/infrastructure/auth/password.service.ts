import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await this.deriveKey(password, salt);

    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, hashHex] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !hashHex) {
      return false;
    }

    const expectedHash = Buffer.from(hashHex, 'hex');
    if (expectedHash.length !== 64 || expectedHash.toString('hex') !== hashHex) {
      return false;
    }

    const derivedKey = await this.deriveKey(password, salt);

    return timingSafeEqual(derivedKey, expectedHash);
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
