import { UserEntity } from '../user.entity';

export interface UserResponseInterface {
  user: Omit<UserEntity, 'hashPassword' | 'password'> & { token: string };
}
