import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import mongoose, { Model, mongo } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  generateOTP,
  hashPasswordHelper,
  parseQueryParams,
} from '@/helpers/util';
import { v4 as uuidv4 } from 'uuid';
import { CreateAuthDto, CodeAuthDto } from '@/auth/dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

const dayjs = require('dayjs');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  isEmailExist = async (email: string) => {
    const isEmailExist = await this.userModel.exists({ email });
    if (isEmailExist) return true;
    return false;
  };

  async create(data: CreateUserDto) {
    const { name, email, password, phone, address, image } = data;
    // CHECK EMAIL
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        'Email already exists. Please use another email',
      );
    }
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: any) {
    const { limit, skip, sort, filter } = parseQueryParams(query);
    const totalItems = await this.userModel.find(filter);
    const totalPages = Math.ceil(totalItems.length / limit);
    const results = await this.userModel
      .find(filter)
      .limit(limit)
      .skip(skip)
      .select('-password')
      .sort(sort);

    return { results, totalPages };
  }
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
  async update(data: UpdateUserDto) {
    const user = await this.userModel.updateOne(
      { _id: data._id },
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    );
    return user;
  }

  remove(_id: string) {
    if (!mongoose.isValidObjectId(_id)) {
      throw new BadRequestException('_id Invalid');
    }
    return this.userModel.deleteOne({ _id });
  }

  async handleRegister(data: CreateAuthDto) {
    const { name, email, password } = data;
    // CHECK EMAIL
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException({
        error: 'EMAIL_ALREADY_EXISTS',
      });
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = generateOTP();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId,
      codeExpired: dayjs(new Date()).add(1, 'minute'),
    });

    this.mailerService.sendMail({
      to: 'phanhoangphuc8991@gmail.com', 
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Testing Nest MailerModule ✔', 
      text: 'welcome',
      template: 'register.hbs',
      context: {
        name: user.name || user.email,
        activationCode: codeId,
      },
    });

    return {
      _id: user._id,
      email,
    };
  }

  async handleVerify(data: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
      codeId: data.code,
    });
    if (!user) {
      throw new BadRequestException('Code Invalid');
    }

    const isBeforeCheck = dayjs().isBefore(user.codeExpired);
    if (isBeforeCheck) {
      await this.userModel.updateOne({ _id: user._id }, { isActive: true });
      return {
        isBeforeCheck,
      };
    } else {
      throw new BadRequestException(`Code expired `);
    }
  }

  async resendActivation({email}) {
    // check email
    const user = await this.userModel.findOne({
      email,
    });
    const codeId = generateOTP();
   
    // update user
    await user.updateOne({
      codeId,
      codeExpired: dayjs(new Date()).add(1, 'minute'),
    });
    this.mailerService.sendMail({
      to: 'phanhoangphuc8991@gmail.com', 
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Testing Nest MailerModule ✔',
      text: 'welcome',
      template: 'register.hbs', 
      context: {
        name: user.name || user.email,
        activationCode: codeId,
      },
    });
    return { _id: user._id };
  }
}
