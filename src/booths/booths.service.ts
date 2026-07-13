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

    // توزيع يدوي للأكشاك الـ 12 لتبدو كمعرض حقيقي بممرات ومساحات مختلفة
    const boothsToCreate = [
      // الجناح الأيمن (Right Wing) - 4 أكشاك متفرقة
      {
        boothId: 'B1',
        status: 'Available',
        position3D: { x: -12, y: 0, z: 12 },
        companyDetails: { category: 'Premium VIP' },
      },
      {
        boothId: 'B2',
        status: 'Available',
        position3D: { x: -14, y: 0, z: 4 },
        companyDetails: { category: 'Standard' },
      },
      {
        boothId: 'B3',
        status: 'Available',
        position3D: { x: -10, y: 0, z: -4 },
        companyDetails: { category: 'Standard' },
      },
      {
        boothId: 'B4',
        status: 'Available',
        position3D: { x: -12, y: 0, z: -12 },
        companyDetails: { category: 'VIP Booth' },
      },

      // الجناح الأيسر (Left Wing) - 4 أكشاك متفرقة
      {
        boothId: 'B5',
        status: 'Available',
        position3D: { x: 12, y: 0, z: 12 },
        companyDetails: { category: 'Premium VIP' },
      },
      {
        boothId: 'B6',
        status: 'Available',
        position3D: { x: 14, y: 0, z: 4 },
        companyDetails: { category: 'Standard' },
      },
      {
        boothId: 'B7',
        status: 'Available',
        position3D: { x: 10, y: 0, z: -4 },
        companyDetails: { category: 'Standard' },
      },
      {
        boothId: 'B8',
        status: 'Available',
        position3D: { x: 12, y: 0, z: -12 },
        companyDetails: { category: 'VIP Booth' },
      },

      // منطقة المنتصف الخلفية (Center Core) حول المسرح الرئيسي
      {
        boothId: 'B9',
        status: 'Available',
        position3D: { x: -5, y: 0, z: 2 },
        companyDetails: { category: 'Startup Zone' },
      },
      {
        boothId: 'B10',
        status: 'Available',
        position3D: { x: 5, y: 0, z: 2 },
        companyDetails: { category: 'Startup Zone' },
      },
      {
        boothId: 'B11',
        status: 'Available',
        position3D: { x: -4, y: 0, z: -6 },
        companyDetails: { category: 'Tech Zone' },
      },
      {
        boothId: 'B12',
        status: 'Available',
        position3D: { x: 4, y: 0, z: -6 },
        companyDetails: { category: 'Tech Zone' },
      },
    ];

    await this.boothModel.insertMany(boothsToCreate);
    return {
      success: true,
      message: 'تم إعادة تخطيط وتوزيع المعرض هندسياً بنجاح!',
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
    booth.status = 'Pending'; //   وضعه في حالة "قيد الانتظار" حتى يتم تأكيد الحجز
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

  // دالة موافقة الأدمن على الحجز
  async approveBooth(boothId: string) {
    const booth = await this.boothModel.findOne({ boothId });
    if (!booth) throw new NotFoundException('الكشك غير موجود');
    if (booth.status !== 'Pending')
      throw new BadRequestException('هذا الكشك ليس بانتظار الموافقة');

    booth.status = 'Reserved'; // تحويله للون الأحمر المحجوز نهائياً
    await booth.save();
    return {
      success: true,
      message: `تمت الموافقة على حجز الكشك ${boothId} بنجاح`,
    };
  }

  // دالة رفض الحجز وإعادة الكشك متاحاً
  async rejectBooth(boothId: string) {
    const booth = await this.boothModel.findOne({ boothId });
    if (!booth) throw new NotFoundException('الكشك غير موجود');

    booth.status = 'Available'; // تفريغ الكشك وإعادته للأخضر
    booth.investorId = null as any;
    booth.companyDetails = {};
    await booth.save();
    return {
      success: true,
      message: `تم رفض طلب الحجز وإعادة الكشك ${boothId} متاحاً للجميع`,
    };
  }
} // تـأكد من وجود هذا القوس لإغلاق الكلاس بالكامل
