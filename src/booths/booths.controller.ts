import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BoothsService } from './booths.service';

@Controller('booths') // جميع الروابط تبدأ بـ /booths
export class BoothsController {
  constructor(private readonly boothsService: BoothsService) {}

  // 1. رابط تهيئة الـ 12 كشكاً لأول مرة: POST http://localhost:3000/booths/init
  @Post('init')
  async initBooths() {
    return this.boothsService.initializeExpoGrid();
  }

  // 2. رابط جلب الخريطة بالكامل (للزوّار والمستثمرين): GET http://localhost:3000/booths
  @Get()
  async getAllBooths() {
    return this.boothsService.getAllBooths();
  }

  // 3. رابط حجز كشك معين: POST http://localhost:3000/booths/reserve/B4
  @Post('reserve/:boothId')
  async reserveBooth(
    @Param('boothId') boothId: string,
    @Body() investorData: any,
  ) {
    return this.boothsService.reserveBooth(boothId, investorData);
  }
}
