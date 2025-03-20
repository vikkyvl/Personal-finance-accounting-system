export interface UserDTO{
  username: string;
  email: string;
  password: string;
  role?: string;  // Optional, defaults to "user"
}
