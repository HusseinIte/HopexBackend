import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booth, BoothDocument } from './schemas/booth.schema';

@Injectable()
export class BoothsService {
  constructor(
    @InjectModel(Booth.name) private boothModel: Model<BoothDocument>,
  ) {}

  // 1. دالة تهيئة الـ 12 كشكاً تلقائياً في قاعدة البيانات
  async initializeExpoGrid() {
    const count = await this.boothModel.countDocuments();
    if (count > 0) {
      return { message: 'المعطيات موجودة مسبقاً، تم تهيئة المعرض من قبل.' };
    }

    const boothsToCreate: any[] = [];

    for (let i = 1; i <= 12; i++) {
      const row = i <= 6 ? 1 : 2;
      const col = i <= 6 ? i : i - 6;

      boothsToCreate.push({
        boothId: `B${i}`,
        status: 'Available',
        investorId: null,
        position3D: {
          x: (col - 3.5) * 6,
          y: 0,
          z: row === 1 ? -5 : 5,
        },
        companyDetails: {},
      });
    }

    await this.boothModel.insertMany(boothsToCreate);
    return {
      success: true,
      message: 'تم إنشاء وتهيئة الـ 12 كشكاً بنجاح في قاعدة البيانات!',
    };
  }

  // 2. دالة جلب كافة الأكشاك (للـ Three.js)
  async getAllBooths() {
    return this.boothModel.find().sort({ boothId: 1 });
  }

  // 3. دالة حجز الكشك للمستثمر مع معالجة آمنة للـ Types لتجنب أخطاء ESLint
  async reserveBooth(
    boothId: string,
    investorData: {
      investorId: string;
      companyName: string;
      companyLogo?: string;
      description?: string;
      category?: string;
    },
  ) {
    const { investorId, companyName, companyLogo, description, category } =
      investorData;

    if (!investorId || !companyName) {
      throw new BadRequestException(
        'معرف المستثمر واسم الشركة مطلوبان لإتمام الحجز',
      );
    }

    const booth = await this.boothModel.findOne({ boothId });
    if (!booth) {
      throw new NotFoundException(`الكشك رقم ${boothId} غير موجود`);
    }

    if (booth.status === 'Reserved') {
      throw new BadRequestException('هذا الكشك محجوز مسبقاً لمستثمر آخر');
    }

    // تحديث بيانات الكشك وحالته
    booth.status = 'Reserved';
    booth.investorId = investorId as any;

    // تعطيل التحقق من الـ ESLint لهذا السطر الفضفاض آمن برمجياً هنا
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    booth.companyDetails = {
      companyName,
      companyLogo: companyLogo || '',
      description: description || '',
      category: category || 'General',
    };

    await booth.save();

    return {
      success: true,
      message: `تم حجز الكشك ${boothId} بنجاح لشركة ${companyName}`,
      booth,
    };
  }
} // تـأكد من وجود هذا القوس لإغلاق الكلاس بالكامل
