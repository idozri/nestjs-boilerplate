import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ExceptionLog,
  ExceptionLogDocument,
} from '../schemas/exception-log.schema';
import { BaseService } from './base.service';
import { LoggerService } from './logger.service';

@Injectable()
export class ExceptionLogService extends BaseService {
  constructor(
    @InjectModel(ExceptionLog.name)
    private readonly exceptionModel: Model<ExceptionLogDocument>,
    logger: LoggerService
  ) {
    super('ExceptionLogService', logger);
  }

  async saveLog({
    message,
    context,
    severity,
    data,
    metadata,
    cause,
  }: Partial<ExceptionLog>) {
    try {
      await this.exceptionModel.create({
        message,
        context,
        severity,
        data,
        metadata,
        cause,
      });
    } catch (error) {
      this.logger.error('Failed to save log', {
        context: 'ExceptionLogService',
        cause: error,
        data,
        metadata,
      });
    }
  }
}
