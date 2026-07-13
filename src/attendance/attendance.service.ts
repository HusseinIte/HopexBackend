import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../enums/user-role.enum';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>, // حقن جدول المستخدمين للتحقق من الموظف
  ) {}

  async scanStaffQR(qrToken: string) {
    if (!qrToken) {
      throw new BadRequestException('كود الـ QR مطلوب لإتمام العملية');
    }

    // 1. البحث عن الموظف في قاعدة البيانات باستخدام الـ Token الفريد الموجود داخل الـ QR
    const staff = await this.userModel.findOne({
      staffQRToken: qrToken,
      role: UserRole.STAFF, // التأكد من أن المستخدم هو موظف
    });
    if (!staff) {
      throw new NotFoundException(
        'رمز الـ QR غير صحيح أو لا ينتمي لأي موظف مسجل',
      );
    }

    // 2. الذكاء التلقائي: تحديد نوع الحركة بناءً على حالة الموظف الحالية (isInside)
    let currentAction: 'check-in' | 'check-out';
    let responseMessage = '';

    if (staff.isInside === false) {
      // الموظف خارج المعرض ⬅️ الحركة هي دخول
      currentAction = 'check-in';
      staff.isInside = true; // قلب الحالة إلى داخل المعرض
      responseMessage = `أهلاً بك يا ${staff.name}، تم تسجيل دخولك بنجاح.`;
    } else {
      // الموظف داخل المعرض ⬅️ الحركة هي خروج
      currentAction = 'check-out';
      staff.isInside = false; // قلب الحالة إلى خارج المعرض
      responseMessage = `رافقتك السلامة يا ${staff.name}، تم تسجيل خروجك بنجاح.`;
    }

    // 3. حفظ الحالة الجديدة للموظف في جدول المستخدمين
    await staff.save();

    // 4. إنشاء سجل حركة جديد وحفظه في جدول الحضور والانصراف (Attendance Logs)
    const newLog = new this.attendanceModel({
      staffId: staff._id,
      actionType: currentAction,
      timestamp: new Date(), // تخزين الوقت والتاريخ بدقة لحظية
    });
    await newLog.save();

    // 5. إرجاع النتيجة لتطبيق الموبايل لعرض الرسالة المناسبة
    return {
      success: true,
      action: currentAction,
      message: responseMessage,
      staffName: staff.name,
      time: newLog.timestamp,
    };
  }

  // دالة إضافية للأدمن: لجلب جميع سجلات الحضور لعرضها في لوحة التحكم لاحقاً
  async getAllLogs() {
    return this.attendanceModel
      .find()
      .populate('staffId', 'name email') // جلب اسم وإيميل الموظف من جدول المستخدمين تلقائياً
      .sort({ timestamp: -1 }); // ترتيب الحركات من الأحدث إلى الأقدم
  }
}
