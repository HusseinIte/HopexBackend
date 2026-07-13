import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance') // جميع الروابط تبدأ بـ /attendance
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // 1. رابط مسح الكود: POST http://localhost:3000/attendance/scan
  @Post('scan')
  async scanQR(@Body('qrToken') qrToken: string) {
    return this.attendanceService.scanStaffQR(qrToken);
  }

  // 2. رابط لوحة تحكم الأدمن: GET http://localhost:3000/attendance/logs
  @Get('logs')
  async getLogs() {
    return this.attendanceService.getAllLogs();
  }
}
