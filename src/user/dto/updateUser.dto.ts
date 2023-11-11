import { IsEmail } from 'class-validator';

export class UpdateUserDto {
  readonly username?: string;
  readonly password?: string;
  readonly image?: string;
  readonly bio?: string;

  @IsEmail()
  readonly email?: string;
}
