# OpenMusic API - Versi 3

Ini adalah proyek RESTful API untuk aplikasi pemutar musik "OpenMusic". Proyek ini merupakan versi final dari submission untuk kelas "Belajar Fundamental Back-End dengan JavaScript" di Dicoding, yang dibangun di atas fondasi v1 dan v2.

API v3 memperkenalkan fitur-fitur tingkat lanjut seperti unggah sampul album, fitur menyukai album dengan caching, dan ekspor playlist asinkron menggunakan message queue untuk meningkatkan fungsionalitas, skalabilitas, dan responsivitas aplikasi.

## Fitur Utama

### Fitur Dasar (v1 & v2)

- **Manajemen Album & Lagu**: Fungsionalitas CRUD penuh untuk data album dan lagu.
- **Registrasi & Autentikasi Pengguna**:
  - `POST /users`: Mendaftarkan pengguna baru.
  - `POST /authentications`: Login untuk mendapatkan *Access Token* dan *Refresh Token* (JWT).
  - `PUT /authentications`: Memperbarui *Access Token* via *Refresh Token*.
  - `DELETE /authentications`: Logout dengan menghapus *Refresh Token*.
- **Manajemen Playlist & Kolaborasi**:
  - Pengguna dapat membuat, melihat, dan menghapus playlist pribadi.
  - Menambah dan menghapus lagu dari playlist.
  - Menambahkan atau menghapus pengguna lain sebagai kolaborator.
  - Otorisasi berbasis kepemilikan atau status kolaborasi.
- **Riwayat Aktivitas Playlist**: Melihat riwayat penambahan dan penghapusan lagu dalam sebuah playlist.

### Fitur Baru (v3)

- **Unggah Sampul Album**:
  - `POST /albums/{id}/covers`: Mengunggah file gambar (JPG, PNG, JPEG) sebagai sampul album, yang disimpan di *local storage*.
- **Menyukai Album (Likes)**:
  - `POST /albums/{id}/likes`: Menambahkan "suka" ke sebuah album.
  - `DELETE /albums/{id}/likes`: Membatalkan "suka" dari sebuah album.
  - `GET /albums/{id}/likes`: Melihat jumlah total "suka" pada sebuah album.
- **Server-Side Caching dengan Redis**:
  - Menerapkan caching pada endpoint untuk mendapatkan jumlah suka album, mengurangi beban database secara signifikan. Respons dari cache akan menyertakan header `X-Data-Source: cache`.
- **Ekspor Lagu pada Playlist (Asynchronous)**:
  - `POST /export/playlists/{playlistId}`: Mengirimkan permintaan untuk mengekspor daftar lagu dari sebuah playlist ke email target. Proses ini ditangani secara asinkron menggunakan **RabbitMQ** sebagai *message broker* dan diproses oleh aplikasi *consumer* terpisah.

## Teknologi yang Digunakan

- **Framework**: Hapi.js (@hapi/hapi)
- **Database**: PostgreSQL
- **Driver Database**: node-postgres (pg)
- **Migrasi Database**: node-pg-migrate
- **Autentikasi**: JSON Web Token (@hapi/jwt) & Bcrypt
- **Validasi**: Joi
- **Caching**: Redis
- **Message Broker**: RabbitMQ (amqplib)
- **Email (Consumer)**: Nodemailer
- **Linting**: ESLint dengan style guide Airbnb

## Persiapan & Instalasi

1. **Clone Repository**

   ```bash
   # Ganti URL dengan repository Anda
   git clone https://github.com/username/proyek-openmusic-api-v3.git
   cd proyek-openmusic-api-v3
   ```

2. **Instal Dependensi**

   ```bash
   npm install
   ```

3. **Setup Layanan Eksternal**

   - Pastikan **PostgreSQL**, **Redis**, dan **RabbitMQ** sudah terinstal dan berjalan. Sangat direkomendasikan menggunakan Docker untuk kemudahan setup.

4. **Konfigurasi Environment Variable**

   - Salin berkas `.env.example` menjadi `.env`.

     ```bash
     cp .env.example .env
     ```

   - Buka berkas `.env` dan sesuaikan semua nilainya, termasuk kredensial untuk database, JWT, RabbitMQ, dan Redis.

     ```env
     # Hapi Server
     HOST=localhost
     PORT=5000

     # PostgreSQL Database
     PGUSER=user_database
     PGPASSWORD=password_database
     PGDATABASE=openmusicdb_v3
     PGHOST=localhost
     PGPORT=5432

     # JWT Token Secrets
     ACCESS_TOKEN_KEY=kunci_rahasia_access_token_super_aman
     REFRESH_TOKEN_KEY=kunci_rahasia_refresh_token_yang_berbeda_dan_aman
     ACCESS_TOKEN_AGE=3600

     # RabbitMQ
     RABBITMQ_SERVER=amqp://localhost

     # Redis
     REDIS_SERVER=redis://localhost
     ```

5. **Jalankan Migrasi Database**

   - Perintah ini akan membuat atau memperbarui semua tabel yang dibutuhkan di database.

     ```bash
     npm run migrate up
     ```

## Menjalankan Aplikasi

- **Menjalankan Server API Utama** (mode development dengan auto-reload):

  ```bash
  npm run start
  ```

- Server akan berjalan di `http://{HOST}:{PORT}` (contoh: `http://localhost:5000`).

- **Penting**: Untuk fungsionalitas penuh (khususnya ekspor playlist), pastikan aplikasi **Consumer** (`openmusic-consumer`) juga berjalan secara bersamaan.

## Struktur Proyek

```text
.
├── migrations/             # Berkas-berkas migrasi database
├── src/
│   ├── api/                # Folder untuk semua plugin API (albums, songs, users, dst.)
│   ├── exceptions/         # Kelas-kelas Error kustom (NotFoundError, ClientError, dll.)
│   ├── services/           # Logika bisnis dan interaksi dengan database, cache, & storage
│   ├── tokenize/           # Helper untuk manajemen JWT
│   ├── validator/          # Skema dan logika validasi Joi untuk setiap API
│   └── server.js           # Titik masuk utama dan konfigurasi server Hapi
├── .env.example            # Contoh template untuk environment variable
├── eslint.config.mjs       # Konfigurasi ESLint
├── package.json
└── README.md
```