import aqp from 'api-query-params';
import * as bcrypt from 'bcrypt';
const saltRounds = 10;
import { randomInt } from 'crypto';

interface ParseQueryParams {
  limit: number;
  skip: number;
  filter: Record<string, any>;
  sort: Record<string, any>;
}

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    return bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    console.log(error);
  }
};

export const comparePasswordHelper = async (
  plainPassword: string = '',
  hashPassword: string = '',
) => {
  try {
    return bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {
    console.log(error);
  }
};

export const parseQueryParams = (rawQuery: any): ParseQueryParams => {
  const formatQuery = aqp(rawQuery);
  const { filter, sort } = formatQuery;
  const { page, pageSize, ...restFilter } = filter;
  const skip = (page - 1) * pageSize;
  return {
    limit: pageSize,
    skip,
    filter: restFilter,
    sort,
  };
};

export const generateOTP = (): string => randomInt(100000, 1000000).toString();
