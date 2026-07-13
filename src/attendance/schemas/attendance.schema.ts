import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staffId: Types.ObjectId; // معرف الموظف المرتبط بجدول المستخدمين

  @Prop({ required: true, enum: ['check-in', 'check-out'] })
  actionType: string; // نوع الحركة: دخول أم خروج

  @Prop({ default: Date.now })
  timestamp: Date; // الوقت والتاريخ الدقيق للحركة
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
