import { ApiProperty } from '@nestjs/swagger';
import { APIResponseDto } from './api.response.dto';

export class PaginatedApiResponseDto<T> extends APIResponseDto<T[]> {
  @ApiProperty({ description: 'Total number of items available' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;
}
