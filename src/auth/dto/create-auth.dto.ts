import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: 'Id is required' })
  _id: string;

  @IsNotEmpty({ message: 'Email is required' })
  code: string;
}
