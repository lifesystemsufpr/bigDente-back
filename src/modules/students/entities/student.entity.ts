import { IUser } from '../../users/entities/user.entity';

export interface IStudent extends IUser {
  studentId?: number;
  code: string;
  grr: string;
  course: string;
  userId: number;
}
