import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExceptionLogService } from './exception-log.service';
import {
  ExceptionLog,
  ExceptionLogSchema,
} from '../schemas/exception-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExceptionLog.name, schema: ExceptionLogSchema },
    ]),
  ],
  providers: [ExceptionLogService],
  exports: [ExceptionLogService],
})
export class ExceptionLogModule {}
