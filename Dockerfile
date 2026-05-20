# === Stage 1: Build Stage ===
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# คัดลอกไฟล์จัดการ Dependency
COPY package*.json ./

# ติดตั้ง Dependencies ทั้งหมด (รวมถึง devDependencies สำหรับคอมไพล์)
RUN npm ci

# คัดลอกซอร์สโค้ดทั้งหมด
COPY . .

# คอมไพล์ TypeScript เป็น JavaScript (จะได้โฟลเดอร์ /dist)
RUN npm run build

# ลบ node_modules เดิม แล้วติดตั้งเฉพาะ Production Dependencies (เพื่อลดขนาด Image)
RUN rm -rf node_modules && npm ci --only=production

# === Stage 2: Production Run Stage ===
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# คัดลอกเฉพาะไฟล์ที่จำเป็นมาจาก Stage 1
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# กำหนดสิทธิ์ให้ใช้ User 'node' (ไม่ใช้ root เพื่อความปลอดภัย)
USER node

# เปิดพอร์ตตามที่ NestJS รัน (ปกติคือ 3000)
EXPOSE 3000

# คำสั่งรันแอปพลิเคชัน
CMD ["node", "dist/main"]