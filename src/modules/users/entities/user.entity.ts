import { ROLE } from './role.enum';

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: ROLE;
}
