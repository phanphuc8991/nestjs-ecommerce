import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import mongoose, { Model, mongo } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { hashPasswordHelper, parseQueryParams } from '@/helpers/util';
import { v4 as uuidv4 } from 'uuid';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
const dayjs = require('dayjs');

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  isEmailExist = async (email: string) => {
    const isEmailExist = await this.userModel.exists({ email });
    if (isEmailExist) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
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
  async update(updateUserDto: UpdateUserDto) {
    const user = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        address: updateUserDto.address,
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

  async handleRegister(registerDto: CreateAuthDto) {
     const { name, email, password } = registerDto;
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
      isActive: false,
      codeId: uuidv4(),
      codeExpired: dayjs(new Date()).add(1,'minute')
    });

    return {
      _id: user._id,  
    }
  }
}

