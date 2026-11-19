import { SterilizationStatus as S } from '../../generated/prisma/client';

export const ALLOWED_TRANSITIONS: Record<S, S[]> = {
  [S.PENDING]:   [S.SUBMITTED, S.CANCELLED, S.ERROR],
  [S.SUBMITTED]: [S.COMPLETED, S.ERROR, S.CANCELLED],
  [S.COMPLETED]: [S.DELIVERED],
  [S.ERROR]:     [S.PENDING, S.CANCELLED], // reprocessar ou desistir
  [S.DELIVERED]: [],                       // terminal
  [S.CANCELLED]: [],                       // terminal
};

export const canTransition = (from: S, to: S) =>
  ALLOWED_TRANSITIONS[from].includes(to);