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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import aqp from 'api-query-params';
import { QueryUserDto } from './dto/query-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    return this.usersService.create(createUserDto);
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
