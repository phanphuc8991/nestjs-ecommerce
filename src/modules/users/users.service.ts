import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
import { CreateAuthDto, CodeAuthDto } from '@/auth/dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

const dayjs = require('dayjs');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
    @Inject('CLOUDINARY') private cloudinary,
  ) {}

  isEmailExist = async (email: string) => {
    const isEmailExist = await this.userModel.exists({ email });
    if (isEmailExist) return true;
    return false;
  };

  async create(data: CreateUserDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      avatarUrl,
      avatarPublicId,
      phone,
      address,
    } = data;
    // CHECK EMAIL
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        'Email already exists. Please use another email',
      );
    }
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      avatarUrl,
      avatarPublicId,
      phone,
      address,
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
        firstName: data.firstName,
        lastName: data.lastName,
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
    const { firstName, lastName, email, password } = data;
    // CHECK EMAIL
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      console.log('email is exist');
      throw new BadRequestException({
        message: 'Email already exists. Please use another email',
        type: 'EMAIL_ALREADY_EXISTS',
      });
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = generateOTP();
    const user = await this.userModel.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      status: 'inactive',
      codeId,
      codeExpired: dayjs().add(1, 'minute'),
    });
    this.mailerService.sendMail({
      to: 'phanhoangphuc8991@gmail.com',
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Testing Nest MailerModule ✔',
      text: 'welcome',
      template: 'register.hbs',
      context: {
        name: user.email,
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
      await this.userModel.updateOne({ _id: user._id }, { status: 'active' });
      return {
        isBeforeCheck,
      };
    } else {
      throw new BadRequestException(`Code expired `);
    }
  }

  async resendActivation({ email }) {
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
        name: user.email,
        activationCode: codeId,
      },
    });
    return { _id: user._id };
  }

  async findOrCreateGoogleUser(payload: {
    email: string;
    avatarUrl: string;
    providerId: string;
  }) {
    const { email, avatarUrl, providerId } = payload;
    let user = await this.userModel.findOne({ email });

    if (user) {
      const hasGoogleLink = user.socialLinks?.some(
        (link) => link.provider === 'google',
      );
      if (!hasGoogleLink) {
        user.socialLinks.push({ provider: 'google', providerId });
        if (!user.avatarUrl) user.avatarUrl = avatarUrl;
        await user.save();
      }
      return user;
    }

    return await this.userModel.create({
      email,
      avatarUrl,
      password: null,
      status: 'active',
      accountType: 'GOOGLE',
      socialLinks: [{ provider: 'google', providerId }],
      role: 'USER',
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'users',
  ): Promise<UploadApiResponse> {
    // Kiểm tra file buffer
    if (!file?.buffer || file.buffer.length === 0) {
      throw new Error('File buffer is empty or invalid');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ecommerce/${folder}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
          resource_type: 'image',
          overwrite: false,
          invalidate: true,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }

          if (!result) {
            return reject(new Error('No result returned from Cloudinary'));
          }

          resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
