import { TransformFnParams } from 'class-transformer';

export function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : (value as unknown);
}

export function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : (value as unknown);
}

export function normalizeUppercase({ value }: TransformFnParams): unknown {
  return typeof value === 'string'
    ? value.trim().toUpperCase()
    : (value as unknown);
}
