# OpenMusic API - Versi 2

Ini adalah proyek RESTful API untuk aplikasi pemutar musik bernama "OpenMusic". Proyek ini merupakan versi lanjutan dari OpenMusic API v1 dan dibuat sebagai submission untuk kelas "Belajar Membuat Aplikasi Back-End untuk Pemula" di Dicoding.

API v2 memperkenalkan fitur-fitur krusial seperti autentikasi pengguna, manajemen playlist pribadi, dan kolaborasi, yang dibangun di atas fondasi Hapi Framework dan database PostgreSQL.

## Fitur Utama

- **Manajemen Album & Lagu (v1)**: Semua fungsionalitas CRUD dari v1 tetap dipertahankan.
- **Registrasi & Autentikasi Pengguna**:
  - `POST /users`: Mendaftarkan pengguna baru dengan username unik.
  - `POST /authentications`: Login pengguna untuk mendapatkan *Access Token* dan *Refresh Token*.
  - `PUT /authentications`: Memperbarui *Access Token* menggunakan *Refresh Token*.
  - `DELETE /authentications`: Logout dengan menghapus *Refresh Token*.
- **Manajemen Playlist Pribadi**:
  - `POST /playlists`: Membuat playlist baru (hanya untuk pengguna terautentikasi).
  - `GET /playlists`: Melihat daftar playlist yang dimiliki atau dikolaborasikan.
  - `DELETE /playlists/{id}`: Menghapus playlist (hanya oleh pemilik).
- **Lagu dalam Playlist (Many-to-Many)**:
  - `POST /playlists/{id}/songs`: Menambahkan lagu ke dalam playlist.
  - `GET /playlists/{id}/songs`: Melihat daftar lagu di dalam sebuah playlist.
  - `DELETE /playlists/{id}/songs`: Menghapus lagu dari sebuah playlist.
- **Otorisasi**: Akses ke playlist dibatasi hanya untuk pemilik atau kolaborator.
- **Validasi Data**: Menggunakan `Joi` untuk memastikan semua data yang masuk sesuai dengan skema yang ditentukan.
- **Penanganan Error Terpusat**: Menggunakan sistem Hapi Extension (`onPreResponse`) untuk menangani semua error secara konsisten, termasuk status `401 Unauthorized` dan `403 Forbidden`.

## Fitur Opsional

- **Kolaborasi Playlist**:
  - `POST /collaborations`: Pemilik playlist dapat menambahkan pengguna lain sebagai kolaborator.
  - `DELETE /collaborations`: Pemilik playlist dapat menghapus kolaborator.
- **Riwayat Aktivitas Playlist**:
  - `GET /playlists/{id}/activities`: Melihat riwayat penambahan dan penghapusan lagu dalam sebuah playlist.

## Teknologi yang Digunakan

- **Framework**: Hapi.js (@hapi/hapi)
- **Autentikasi**: JSON Web Token (@hapi/jwt)
- **Enkripsi Password**: Bcrypt
- **Database**: PostgreSQL
- **Driver Database**: node-postgres (pg)
- **Validasi**: Joi
- **Migrasi Database**: node-pg-migrate
- **Linting**: ESLint dengan style guide Airbnb

## Persiapan & Instalasi

1.  **Clone Repository**
    ```bash
    git clone https://github.com/dzakwanalifi/OpenMusic-API-2
    cd OpenMusic-API-2
    ```

2.  **Instal Dependensi**
    ```bash
    npm install
    ```

3.  **Setup Database**
    - Pastikan PostgreSQL sudah terinstal dan berjalan.
    - Buat database baru untuk proyek ini (misalnya, `openmusicdb_v2`).
    - Buat user dan password untuk database tersebut.

4.  **Konfigurasi Environment Variable**
    - Salin berkas `.env.example` menjadi `.env`.
      ```bash
      cp .env.example .env
      ```
    - Buka berkas `.env` dan sesuaikan nilainya dengan konfigurasi server dan database Anda. Pastikan untuk mengisi `ACCESS_TOKEN_KEY` dan `REFRESH_TOKEN_KEY` dengan string rahasia yang kuat dan berbeda.
      ```env
      # Hapi Server
      HOST=localhost
      PORT=5000

      # PostgreSQL Database
      PGUSER=user_database_anda
      PGPASSWORD=password_database_anda
      PGDATABASE=openmusicdb_v2
      PGHOST=localhost
      PGPORT=5432

      # JWT Token Secrets
      ACCESS_TOKEN_KEY=kunci_rahasia_access_token_super_aman
      REFRESH_TOKEN_KEY=kunci_rahasia_refresh_token_yang_berbeda_dan_aman
      ```

5.  **Jalankan Migrasi Database**
    - Perintah ini akan membuat semua tabel yang dibutuhkan (`albums`, `songs`, `users`, `authentications`, `playlists`, `playlist_songs`, dan tabel opsional) di dalam database Anda.
    ```bash
    npm run migrate up
    ```

## Menjalankan Aplikasi

- Untuk menjalankan server dalam mode development (dengan auto-reload):
  ```bash
  npm run start
  ```
- Server akan berjalan di `http://{HOST}:{PORT}` (contoh: `http://localhost:5000`).

## Struktur Proyek

```
.
├── src/
│   ├── api/                # Folder untuk semua plugin API
│   ├── exceptions/         # Kelas-kelas Error kustom
│   ├── services/           # Logika bisnis dan interaksi database
│   ├── tokenize/           # Helper untuk manajemen JWT
│   └── validator/          # Skema dan logika validasi Joi
│   └── server.js           # Titik masuk utama dan konfigurasi server Hapi
├── migrations/             # Berkas-berkas migrasi database
├── .env.example            # Contoh template untuk environment variable
├── .eslintrc.json          # Konfigurasi ESLint
├── .gitignore
├── package.json
└── # OpenMusic API - Versi 3 (Final)

Ini adalah proyek RESTful API untuk aplikasi pemutar musik "OpenMusic". Proyek ini merupakan versi final dan dibuat sebagai submission untuk kelas "Belajar Membuat Aplikasi Back-End untuk Pemula" di Dicoding.

API v3 memperkenalkan fitur-fitur tingkat lanjut seperti ekspor playlist asinkron, unggah sampul album, caching dengan Redis, dan fitur menyukai album untuk meningkatkan skalabilitas dan fungsionalitas aplikasi.

## Fitur Utama

- **Semua Fitur dari v1 & v2**: Semua fungsionalitas dari versi sebelumnya, termasuk manajemen Album, Lagu, Pengguna, Autentikasi, Playlist, dan Kolaborasi, tetap dipertahankan.
- **Ekspor Lagu pada Playlist (Asynchronous)**:
  - `POST /export/playlists/{playlistId}`: Mengirimkan permintaan untuk mengekspor daftar lagu dari sebuah playlist ke email target. Proses ini ditangani secara asinkron menggunakan **RabbitMQ** sebagai *message broker*.
- **Unggah Sampul Album**:
  - `POST /albums/{id}/covers`: Mengunggah file gambar sebagai sampul album. File dapat disimpan di *local storage* atau **Amazon S3**.
- **Menyukai Album**:
  - `POST /albums/{id}/likes`: Menambahkan "suka" ke sebuah album (membutuhkan autentikasi).
  - `DELETE /albums/{id}/likes`: Membatalkan "suka" dari sebuah album.
  - `GET /albums/{id}/likes`: Melihat jumlah total "suka" pada sebuah album.
- **Server-Side Caching**:
  - Menerapkan caching menggunakan **Redis** pada endpoint untuk mendapatkan jumlah suka album, sehingga mengurangi beban pada database secara signifikan. Respons dari cache akan menyertakan header `X-Data-Source: cache`.

## Teknologi yang Digunakan

- **Framework**: Hapi.js (@hapi/hapi)
- **Autentikasi**: JSON Web Token (@hapi/jwt), Bcrypt
- **Database**: PostgreSQL
- **Message Broker**: RabbitMQ (amqplib)
- **Caching**: Redis
- **File Storage**: Local Storage / Amazon S3
- **Email**: Nodemailer
- **Validasi & Migrasi**: Joi, node-pg-migrate
- **Linting**: ESLint dengan style guide Airbnb

## Persiapan & Instalasi

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/repo-anda.git
    cd open-music-api-v3
    ```

2.  **Instal Dependensi**
    ```bash
    npm install
    ```

3.  **Setup Layanan Eksternal**
    - Pastikan **PostgreSQL**, **RabbitMQ**, dan **Redis** sudah terinstal dan berjalan (direkomendasikan menggunakan Docker).
    - Jika menggunakan S3, siapkan S3 Bucket dan kredensial IAM.
    - Siapkan akun email dan dapatkan kredensial SMTP (misalnya, menggunakan "App Password" dari Gmail).

4.  **Konfigurasi Environment Variable**
    - Salin berkas `.env.example` menjadi `.env`.
      ```bash
      cp .env.example .env
      ```
    - Buka berkas `.env` dan sesuaikan semua nilainya, termasuk kredensial untuk database, JWT, RabbitMQ, Redis, S3, dan SMTP.

5.  **Jalankan Migrasi Database**
    - Perintah ini akan membuat atau memperbarui semua tabel yang dibutuhkan di database.
    ```bash
    npm run migrate up
    ```

## Menjalankan Aplikasi

- Untuk menjalankan server API utama dalam mode development:

  ```bash
  npm run start
  ```

- Server akan berjalan di `http://{HOST}:{PORT}` (contoh: `http://localhost:5000`).

- **Penting**: Aplikasi ini membutuhkan aplikasi **Consumer** untuk berjalan secara bersamaan agar fitur ekspor playlist berfungsi.

## Struktur Aplikasi

```text
.
├── src/
│   ├── api/                # Folder untuk semua plugin API
│   ├── exceptions/         # Kelas-kelas Error kustom
│   ├── services/           # Logika bisnis dan interaksi database
│   ├── tokenize/           # Helper untuk manajemen JWT
│   ├── utils/              # Berisi config.js
│   └── validator/          # Skema dan logika validasi Joi
│   └── server.js           # Titik masuk utama dan konfigurasi server Hapi
├── migrations/             # Berkas-berkas migrasi database
├── .env.example            # Contoh template untuk environment variable
└── ...                     # File konfigurasi lainnya
```