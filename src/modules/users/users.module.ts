import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryProvider } from '@/common/config/cloudinary.config';

@Module({
  imports: [ MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryProvider],
  exports: [UsersService, CloudinaryProvider],
})
export class UsersModule {}
