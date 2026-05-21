import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ทำให้เรียกใช้โมดูลนี้ได้ทุกที่ในโปรเจกต์โดยไม่ต้องอิมพอร์ตซ้ำ
    }),
    PrometheusModule.register(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // configService.get() จะไปดึงค่าจาก Environment Variables ที่เราตั้งไว้ใน docker-compose.yml
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'nestjs_db'),

        autoLoadEntities: true, // โหลด Entities ทั้งหมดในโปรเจกต์เข้าฐานข้อมูลอัตโนมัติ

        // คำเตือน DevOps: synchronize: true จะปรับโครงสร้างตารางตามโค้ดอัตโนมัติ
        // นิยมเปิดเฉพาะตอนพัฒนา (development) แต่ห้ามเปิดบน Production จริงเด็ดขาดเพราะข้อมูลอาจสูญหายได้
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
