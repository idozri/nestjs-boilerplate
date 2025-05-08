import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ErrorSeverity } from '../enums/error-severity.enum';

@Schema({ timestamps: true })
export class ExceptionLog {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  context: string;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ required: true })
  severity: ErrorSeverity;

  @Prop({
    type: {
      name: { type: String },
      message: { type: String },
      stack: { type: String },
    },
    _id: false,
  })
  cause?: {
    name?: string;
    message?: string;
    stack?: string;
  };

  @Prop({ default: Date.now })
  timestamp: Date;
}

export type ExceptionLogDocument = ExceptionLog & Document;
export const ExceptionLogSchema = SchemaFactory.createForClass(ExceptionLog);
