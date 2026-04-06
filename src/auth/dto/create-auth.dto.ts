import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Firstname is required' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Lastname is required' })
  @IsString()
  lastName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: 'Id is required' })
  _id: string;

  @IsNotEmpty({ message: 'Email is required' })
  code: string;
}
