// import { IsEmail, IsNotEmpty } from 'class-validator';

export interface UserDTO{
  username: string;
  email: string;
  password: string;
  role?: string;
}

// export class UserDTO {
//   @IsEmail()
//   email: string;
//
//   @IsNotEmpty()
//   username: string;
//
//   @IsNotEmpty()
//   password: string;
//
//   role?: string;
// }