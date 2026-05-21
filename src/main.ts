import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // สั่งให้ NestJS เปิดใช้ระบบพ่น Log มาตรฐานของตัวเอง
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // 🌟 เขียนมิดเดิ้ลแวร์สั้นๆ เพื่อดักและพ่น Log ทุกครั้งที่มีคนยิงเข้ามาในระบบ
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const logger = new Logger('HTTP');
    // พ่นข้อความบอกว่า: มีใคร (Method อะไร) ยิงเข้ามาที่ URL ไหน
    logger.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  Logger.error(message, stack, 'Bootstrap');
  process.exit(1);
});
