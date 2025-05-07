import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels()
export class APIResponseDto<T> {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  isSuccess: boolean;

  @ApiProperty({
    description: 'The message of the response',
    example: 'The request was successful',
  })
  message: string;

  @ApiProperty({
    description: 'Optional returned data',
    required: false,
  })
  data?: T;
}
