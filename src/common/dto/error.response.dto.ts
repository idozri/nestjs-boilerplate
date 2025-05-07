import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty()
  isSuccess: false;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  errorCode?: string;

  @ApiProperty({ required: false })
  details?: Record<string, any>;
}
