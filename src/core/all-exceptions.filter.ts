import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Catch all types of exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Determine Status Code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Extract raw exception response
    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message };

    // 3. Normalize error response structure
    let type = 'SYSTEM_ERROR';
    let message = 'An unexpected error occurred';

    // Case A: Errors from ValidationPipe (message is typically a string array)
    if (typeof exceptionResponse === 'object' && Array.isArray(exceptionResponse.message)) {
      type = 'VALIDATION_ERROR';
      message = exceptionResponse.message.join(', '); // Join errors: "email invalid, password too short"
    } 
    // Case B: Custom errors thrown by developer (contains type and message)
    else if (typeof exceptionResponse === 'object' && exceptionResponse.type) {
      type = exceptionResponse.type;
      message = exceptionResponse.message;
    }
    // Case C: Plain string errors or Runtime errors
    else {
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse.message || message);
    }

    // 4. Log error to terminal for debugging (Only triggers on 500 errors)
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('💥 [Critical Error]:', exception);
    }

    // 5. Send standardized response to Client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        type,
        message,
      },
    });
  }
}