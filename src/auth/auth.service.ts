import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper } from '@/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto,CodeAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    const isValidPassword = await comparePasswordHelper(pass, user?.password);
    if (!isValidPassword || !user) {
      return null;
    }
    return user;
  }
  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      email: user.email,
      _id: user._id,
      name: user.name,
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    // check email
    return this.usersService.handleRegister(registerDto);
    // hash password
  }

  async checkCode(codeDto: CodeAuthDto) {
   return this.usersService.handleVerify(codeDto);
  }

   async resendActivation(data) {
   return this.usersService.resendActivation(data);
  }
}
