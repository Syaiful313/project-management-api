# Project Management API

Halo! 👋 Ini adalah repository untuk backend **Project Management API**. Project ini dibangun menggunakan **[NestJS](https://nestjs.com/)**, framework Node.js progresif untuk membangun aplikasi sisi server yang efisien, andal, dan dapat diskalakan.

API ini juga dilengkapi dengan **Prisma ORM**, PostgreSQL, arsitektur modular, serta fitur best practice lainnya yang siap digunakan untuk production.

## 🚀 Teknologi yang Digunakan

- **Framework Dasar**: NestJS v11
- **Database ORM**: Prisma ORM dengan `@prisma/adapter-pg`
- **Database**: PostgreSQL
- **Autentikasi**: JWT (JSON Web Tokens) dengan Passport
- **Validasi**: `class-validator` & `class-transformer`
- **Logging**: `nestjs-pino` & `pino-pretty`
- **Containerization**: Docker & Docker Compose

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan kamu sudah menginstal beberapa dependencies berikut di komputermu:

- **Node.js**: Minimal versi 20+ (Disarankan versi LTS terbaru)
- **NPM** atau **Yarn** atau **PNPM**
- **Docker** & **Docker Compose** (Jika ingin menjalankan database/aplikasi via Docker)

## 🛠️ Cara Setup & Menjalankan Project

Ikuti langkah-langkah di bawah ini untuk menjalankan project di lokal kamu:

### 1. Clone Repository & Install Dependencies

Pertama, install semua package yang dibutuhkan dengan menjalankan perintah berikut:

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Duplikat file `.env.example` dan ubah namanya menjadi `.env`:

```bash
cp .env.example .env
```

Sesuaikan konfigurasi di dalam `.env` dengan kredensial lokalmu. Contoh default:

```env
# APP
PORT=8000

# DB
DATABASE_URL="postgresql://postgres:admin@localhost:6543/postgres"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="1d"
```

> **Catatan Penting**: Pastikan mengganti `JWT_SECRET` menjadi kunci yang kuat dan aman saat mendeploy ke production!

### 3. Menjalankan Database

Cara paling mudah untuk menjalankan database PostgreSQL lokal adalah dengan menggunakan Docker Compose yang sudah disediakan:

```bash
npm run docker-dev:up
```

Ini akan me-running container PostgreSQL sesuai spesifikasi di `docker-compose.dev.yml`. Jika ingin mematikannya, gunakan `npm run docker-dev:down`.

### 4. Menjalankan Migrasi Database

Jalankan perintah ini agar Prisma membuat skema struktur tabel di database kamu:

```bash
npm run db:deploy
```

_(Perintah ini juga akan secara otomatis meng-generate Prisma Client)_

### 5. Menjalankan Aplikasi

Kamu siap untuk me-running aplikasi!

```bash
# Mode development (dengan live-reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

API kamu sekarang berjalan di `http://localhost:8000` ✨

## 🗂️ Struktur Project

Aplikasi ini menggunakan struktur folder modular standar NestJS untuk mempermudah scaling:

```
src/
├── common/          # Modules, guards, filters, decorators yang bisa dipakai berulang
│   └── filters/     # Custom exception filters (seperti ApiErrorFilter)
├── modules/         # Feature modules aplikasi
│   ├── auth/        # Modul Autentikasi (Login/Register JWT)
│   └── sample/      # Contoh modul (sebagai referensi)
├── prisma/          # Integrasi modul Prisma
├── app.module.ts    # Root Module NestJS
└── main.ts          # Entry point aplikasi
```

## 📝 Commands yang Tersedia

Berikut adalah jalan pintas npm scripts yang sering dipakai:

- `npm run format`: Merapikan seluruh file code menggunakan Prettier.
- `npm run format:check`: Mengecek apakah kode sudah terformat dengan benar.
- `npm run db:deploy`: Melakukan migrasi database via Prisma dan meng-generate Prisma client.
- `npm run docker-dev:up`: Menjalankan server database dev menggunakan Docker Compose.
- `npm run docker-dev:down`: Menghentikan server database dev Docker Compose.
- `npm run docker-prod:up`: Men-deploy container build/database ke tahap production simulasi.

---

Semoga membantu! Jangan ragu untuk membuat _issue_ baru jika menemui kendala. Selamat ngoding! 🚀
