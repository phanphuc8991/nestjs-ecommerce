import { IsInt, IsOptional, Min, IsString, IsEnum, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  NAME = 'name',
  EMAIL = 'email',
  AGE = 'age',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryUserDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.NAME;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;
  
   @IsOptional()
  @IsString()
 sort: string
}