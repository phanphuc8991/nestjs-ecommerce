import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper } from '@/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto, CodeAuthDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    const isValidPassword = await comparePasswordHelper(pass, user?.password);
    if (!isValidPassword || !user) {
      return null;
    }
    return user;
  }
  async login(user) {
    const payload = { email: user.email, sub: user._id };
    return {
      email: user.email,
      _id: user._id,
      name: user.name,
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginGoogle({idToken}: {idToken: string}) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
      // 1. Verify token với Google
      const ticket = await client.verifyIdToken({
        idToken:idToken ,
        audience: googleClientId,
      });
      console.log('ticket',ticket);
      const payload = ticket.getPayload();
      console.log('payload',payload);
      if (!payload) throw new BadRequestException('Invalid Google Token');
      const user = await this.usersService.findOrCreateGoogleUser({
        email: payload.email,
        avatarUrl: payload.picture,
        providerId: payload.sub,
      });
      return this.login(user);
    } catch (error) {
      console.log('error',error);
    }
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
