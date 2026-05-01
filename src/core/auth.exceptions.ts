import { 
  BadRequestException, 
  ConflictException, 
  ForbiddenException, 
  UnauthorizedException 
} from '@nestjs/common';

// --- 401: UNAUTHORIZED ---

/**
 * Used when email or password doesn't match
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      type: 'INVALID_CREDENTIALS',
      message: 'The email or password you entered is incorrect.',
    });
  }
}

// --- 403: FORBIDDEN ---

/**
 * Used when account is disabled or not yet activated
 */
export class AccountInactiveException extends ForbiddenException {
  constructor() {
    super({
      type: 'ACCOUNT_INACTIVE',
      message: 'Your account is inactive. Please activate your account or contact support.',
    });
  }
}

// --- 409: CONFLICT ---

/**
 * Used during registration if email is already taken
 */
export class EmailExistsException extends ConflictException {
  constructor() {
    super({
      type: 'EMAIL_ALREADY_EXISTS',
      message: 'This email is already registered. Please use another one.',
    });
  }
}

// --- 400: BAD REQUEST ---

/**
 * Used for malformed or broken verification links
 */
export class InvalidLinkException extends BadRequestException {
  constructor() {
    super({
      type: 'INVALID_ID',
      message: 'Invalid verification link. Please check your email and try again.',
    });
  }
}

/**
 * Used when the OTP/Verification code is wrong
 */
export class InvalidCodeException extends BadRequestException {
  constructor() {
    super({
      type: 'INVALID_CODE',
      message: 'The verification code is incorrect. Please try again.',
    });
  }
}

/**
 * Used when the OTP/Verification code has timed out
 */
export class CodeExpiredException extends BadRequestException {
  constructor() {
    super({
      type: 'CODE_EXPIRED',
      message: 'The verification code has expired. Please request a new one.',
    });
  }
}