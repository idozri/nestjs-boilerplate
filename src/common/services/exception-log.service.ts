import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExceptionLog, ExceptionLogDocument } from '../schemas/exception-log.schema';

@Injectable()
export class ExceptionLogService {
  constructor(
    @InjectModel(ExceptionLog.name)
    private readonly exceptionModel: Model<ExceptionLogDocument>
  ) {}

  async saveLog(
    message: string,
    context: string,
    severity: string,
    metadata: Record<string, any>
  ) {
    await this.exceptionModel.create({
      message,
      context,
      severity,
      metadata,
    });
  }
}
