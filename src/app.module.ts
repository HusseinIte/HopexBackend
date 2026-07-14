import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { BoothsModule } from './booths/booths.module'; // أضف هذا السطر

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/expo2025_db',
    ),
    AuthModule,
    AttendanceModule,
    BoothsModule, // أضف الموديول هنا في المصفوفة
  ],
})
export class AppModule {}
