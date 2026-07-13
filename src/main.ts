import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // تفعيل الـ CORS بشكل كامل لجميع النطاقات والموبايلات
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // جعل السيرفر يستقبل الاتصال من أي جهاز على الشبكة المحلية
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
