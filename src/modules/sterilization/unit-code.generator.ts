import { randomInt } from 'node:crypto';
import { SterilizationCase } from '../../generated/prisma/client';

// sem 0/O/1/I para evitar confusão na leitura da etiqueta
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateUnitCode(type: SterilizationCase, now = new Date()) {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Array.from(
    { length: 6 },
    () => ALPHABET[randomInt(ALPHABET.length)],
  ).join('');
  return `${type}-${yy}${mm}${dd}-${rand}`;
}
