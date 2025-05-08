import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorSeverity } from '../enums/error-severity.enum';

export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly severity: ErrorSeverity = ErrorSeverity.ERROR
  ) {
    super(message, status);
  }
}
