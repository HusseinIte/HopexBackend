import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoothsService } from './booths.service';
import { BoothsController } from './booths.controller';
import { Booth, BoothSchema } from './schemas/booth.schema';

@Module({
  imports: [
    // ربط الموديول بجدول الأكشاك في قاعدة البيانات
    MongooseModule.forFeature([{ name: Booth.name, schema: BoothSchema }]),
  ],
  controllers: [BoothsController],
  providers: [BoothsService],
})
export class BoothsModule {}
