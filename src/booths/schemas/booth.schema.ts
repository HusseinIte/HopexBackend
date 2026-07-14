import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoothDocument = Booth & Document;

// كلاس يمثل الإحداثيات ثلاثية الأبعاد التي تحتاجها Three.js
class Position3D {
  @Prop({ required: true })
  x!: number;

  @Prop({ required: true })
  y!: number;

  @Prop({ required: true })
  z!: number;
}

@Schema({ timestamps: true })
export class Booth {
  @Prop({ required: true, unique: true })
  boothId!: string; // المعرف الفريد للكشك مثل (B1, B2, B3... حتى B12)

  @Prop({
    required: true,
    enum: ['Available', 'Pending', 'Reserved'],
    default: 'Available',
  })
  status!: string; // الحالات تصبح: متاح، قيد الانتظار، محجوز نهائياً

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  investorId!: Types.ObjectId; // معرف المستثمر الذي حجز الكشك (مرتبط بجدول الـ Users)

  @Prop({ type: Position3D, required: true })
  position3D!: Position3D; // موقع الكشك في الفضاء ثلاثي الأبعاد داخل الصالة

  // تفاصيل الشركة المستثمرة للكشك ليراها الزائر عند النقر عليه
  @Prop({
    type: {
      companyName: { type: String, default: '' },
      companyLogo: { type: String, default: '' },
      description: { type: String, default: '' },
      category: { type: String, default: '' }, // تخصص الشركة (برمجيات، ذكاء اصطناعي، اتصالات...)
    },
    default: {},
  })
  companyDetails!: Record<string, any>;

  // ── تقييمات الزوّار (مجمّعة) ──────────────────────────────────────────────
  // نخزّن مجموع النجوم وعدد التقييمات فقط؛ المعدّل = ratingSum / ratingCount.
  // هكذا يرى صاحب الكشك (المستثمر) والأدمن مجموع تقييمات الزوّار ومعدّلها.
  @Prop({ default: 0 })
  ratingSum!: number; // مجموع كل النجوم التي منحها الزوّار

  @Prop({ default: 0 })
  ratingCount!: number; // عدد الزوّار الذين قيّموا هذا الكشك
}

export const BoothSchema = SchemaFactory.createForClass(Booth);
