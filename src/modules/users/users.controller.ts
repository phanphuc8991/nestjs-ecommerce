import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import aqp from 'api-query-params';
import { QueryUserDto } from './dto/query-user.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { Express } from 'express';
import { Public } from '@/decorator/customize';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // max 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    let avatarUrl: string | undefined;
    let avatarPublicId: string | undefined;
    if (file) {
      const uploadResult = await this.usersService.uploadImage(
        file,
        'users/avatars',
      );
      avatarUrl = uploadResult.secure_url;
      avatarPublicId = uploadResult.publicId;
    }
    const data = { ...createUserDto, avatarUrl, avatarPublicId };
    return this.usersService.create(data);
  }
  
  @Get()
  // `query` → validated DTO (pagination & basic fields)
  // `queryRaw` → original query params for AQP parsing (filters, sort, etc.)
  findAll(@Query() query: QueryUserDto, @Query() queryRaw: any) {
    return this.usersService.findAll(queryRaw);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
