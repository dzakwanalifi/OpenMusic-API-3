# Panduan Pengujian Manual OpenMusic API v3

## Persiapan Pengujian

### 1. Bersihkan Database
Jalankan script SQL berikut untuk memastikan database dalam keadaan bersih:

```sql
TRUNCATE 
  users, 
  authentications, 
  playlists, 
  playlist_songs, 
  collaborations,
  playlist_song_activities,
  user_album_likes,
  albums, 
  songs 
RESTART IDENTITY;
```

**Cara menjalankan:**
- **Menggunakan psql:** `psql -U username -d database_name -f database_cleanup.sql`
- **Menggunakan pgAdmin:** Copy-paste isi file `database_cleanup.sql` ke Query Tool
- **Menggunakan DBeaver/DataGrip:** Buka dan jalankan file `database_cleanup.sql`

### 2. Pastikan Layanan External Berjalan
- **PostgreSQL**: Database utama
- **Redis**: Untuk caching (port 6379)
- **RabbitMQ**: Untuk message queue (port 5672)
- **SMTP**: Untuk email (Gmail/Outlook)

### 3. Pastikan Server Berjalan
```bash
npm start
```

Server harus menampilkan: `Server berjalan pada http://localhost:5000`

### 4. Pastikan Consumer Berjalan
Di terminal terpisah, jalankan consumer:
```bash
cd openmusic-consumer
node src/listener.js
```

Consumer harus menampilkan: `Consumer sedang mendengarkan pesan...`

## Skenario Pengujian dengan Postman

### A. Testing Albums

#### 1. POST /albums - Tambah Album
**Request:**
```json
POST http://localhost:5000/albums
Content-Type: application/json

{
    "name": "Album Test",
    "year": 2023
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Album berhasil ditambahkan",
    "data": {
        "albumId": "album-xxxxxxxxxxxxx"
    }
}
```

#### 2. GET /albums/{id} - Dapatkan Album
**Request:**
```
GET http://localhost:5000/albums/{albumId_from_step_1}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "album": {
            "id": "album-xxxxxxxxxxxxx",
            "name": "Album Test",
            "year": 2023,
            "songs": []
        }
    }
}
```

#### 3. PUT /albums/{id} - Update Album
**Request:**
```json
PUT http://localhost:5000/albums/{albumId_from_step_1}
Content-Type: application/json

{
    "name": "Album Test Updated",
    "year": 2024
}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Album berhasil diperbarui"
}
```

#### 4. DELETE /albums/{id} - Hapus Album (Test di akhir)

### B. Testing Songs

#### 1. POST /songs - Tambah Lagu Tanpa Album
**Request:**
```json
POST http://localhost:5000/songs
Content-Type: application/json

{
    "title": "Lagu Test 1",
    "year": 2023,
    "performer": "Performer Test",
    "genre": "Rock",
    "duration": 180
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Lagu berhasil ditambahkan",
    "data": {
        "songId": "song-xxxxxxxxxxxxx"
    }
}
```

#### 2. POST /songs - Tambah Lagu Dengan Album
**Request:**
```json
POST http://localhost:5000/songs
Content-Type: application/json

{
    "title": "Lagu Test 2",
    "year": 2023,
    "performer": "Performer Test",
    "genre": "Pop",
    "duration": 200,
    "albumId": "{albumId_from_album_test}"
}
```

#### 3. GET /songs - Dapatkan Semua Lagu
**Request:**
```
GET http://localhost:5000/songs
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "songs": [
            {
                "id": "song-xxxxxxxxxxxxx",
                "title": "Lagu Test 1",
                "performer": "Performer Test"
            },
            {
                "id": "song-xxxxxxxxxxxxx",
                "title": "Lagu Test 2",
                "performer": "Performer Test"
            }
        ]
    }
}
```

#### 4. GET /songs?title={title} - Filter Berdasarkan Judul
**Request:**
```
GET http://localhost:5000/songs?title=Test 1
```

#### 5. GET /songs?performer={performer} - Filter Berdasarkan Performer
**Request:**
```
GET http://localhost:5000/songs?performer=Performer Test
```

#### 6. GET /songs/{id} - Dapatkan Lagu Berdasarkan ID
**Request:**
```
GET http://localhost:5000/songs/{songId_from_step_1}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "song": {
            "id": "song-xxxxxxxxxxxxx",
            "title": "Lagu Test 2",
            "year": 2023,
            "performer": "Performer Test",
            "genre": "Pop",
            "duration": 200,
            "albumId": "album-xxxxxxxxxxxxx"
        }
    }
}
```

#### 7. PUT /songs/{id} - Update Lagu
**Request:**
```json
PUT http://localhost:5000/songs/{songId_from_step_1}
Content-Type: application/json

{
    "title": "Lagu Test 1 Updated",
    "year": 2024,
    "performer": "Performer Updated",
    "genre": "Jazz",
    "duration": 220
}
```

#### 8. DELETE /songs/{id} - Hapus Lagu

### C. Testing Error Cases

#### 1. Album Tidak Ditemukan
```
GET http://localhost:5000/albums/album-notfound
```

**Expected Response (404):**
```json
{
    "status": "fail",
    "message": "Album tidak ditemukan"
}
```

#### 2. Lagu Tidak Ditemukan
```
GET http://localhost:5000/songs/song-notfound
```

#### 3. Payload Tidak Valid
```json
POST http://localhost:5000/albums
Content-Type: application/json

{
    "name": "Album Test"
    // year missing
}
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Gagal menambahkan album. Mohon isi nama dan tahun album"
}
```

#### 4. Album ID Tidak Valid Saat Menambah Lagu
```json
POST http://localhost:5000/songs
Content-Type: application/json

{
    "title": "Lagu Test",
    "year": 2023,
    "performer": "Performer Test",
    "genre": "Rock",
    "albumId": "album-notfound"
}
```

### D. Testing Cascade Delete

#### 1. Pastikan Album Memiliki Lagu
- Buat album baru
- Tambahkan beberapa lagu ke album tersebut
- Verifikasi GET /albums/{id} menampilkan lagu-lagu tersebut

#### 2. Hapus Album
```
DELETE http://localhost:5000/albums/{albumId}
```

#### 3. Verifikasi Lagu Terhapus
- Coba akses lagu-lagu yang tadinya ada di album
- Harus mendapat response 404

---

## Testing Fitur OpenMusic API v2

### E. Testing Users (Registrasi Pengguna)

#### 1. POST /users - Registrasi User Baru
**Request:**
```json
POST http://localhost:5000/users
Content-Type: application/json

{
    "username": "testuser1",
    "password": "password123",
    "fullname": "Test User 1"
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "User berhasil ditambahkan",
    "data": {
        "userId": "user-xxxxxxxxxxxxx"
    }
}
```

#### 2. POST /users - Registrasi User Kedua
**Request:**
```json
POST http://localhost:5000/users
Content-Type: application/json

{
    "username": "testuser2",
    "password": "password456",
    "fullname": "Test User 2"
}
```

#### 3. POST /users - Test Username Sudah Digunakan
**Request:**
```json
POST http://localhost:5000/users
Content-Type: application/json

{
    "username": "testuser1",
    "password": "password789",
    "fullname": "Test User Duplicate"
}
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Gagal menambahkan user. Username sudah digunakan."
}
```

### F. Testing Authentication

#### 1. POST /authentications - Login User
**Request:**
```json
POST http://localhost:5000/authentications
Content-Type: application/json

{
    "username": "testuser1",
    "password": "password123"
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Authentication berhasil ditambahkan",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

**💡 Important:** Simpan `accessToken` dan `refreshToken` untuk request selanjutnya!

#### 2. PUT /authentications - Refresh Access Token
**Request:**
```json
PUT http://localhost:5000/authentications
Content-Type: application/json

{
    "refreshToken": "{refreshToken_from_login}"
}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Access Token berhasil diperbarui",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

#### 3. DELETE /authentications - Logout User
**Request:**
```json
DELETE http://localhost:5000/authentications
Content-Type: application/json

{
    "refreshToken": "{refreshToken_from_login}"
}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Refresh token berhasil dihapus"
}
```

#### 4. POST /authentications - Login User Kedua
**Request:**
```json
POST http://localhost:5000/authentications
Content-Type: application/json

{
    "username": "testuser2",
    "password": "password456"
}
```

**💡 Important:** Simpan token untuk testuser2 juga!

### G. Testing Playlists (Memerlukan Authentication)

#### 1. POST /playlists - Buat Playlist (User 1)
**Request:**
```json
POST http://localhost:5000/playlists
Content-Type: application/json
Authorization: Bearer {accessToken_user1}

{
    "name": "My Favorite Songs"
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Playlist berhasil ditambahkan",
    "data": {
        "playlistId": "playlist-xxxxxxxxxxxxx"
    }
}
```

#### 2. POST /playlists - Buat Playlist (User 2)
**Request:**
```json
POST http://localhost:5000/playlists
Content-Type: application/json
Authorization: Bearer {accessToken_user2}

{
    "name": "Rock Collection"
}
```

#### 3. GET /playlists - Dapatkan Playlists User
**Request:**
```
GET http://localhost:5000/playlists
Authorization: Bearer {accessToken_user1}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "playlists": [
            {
                "id": "playlist-xxxxxxxxxxxxx",
                "name": "My Favorite Songs",
                "username": "testuser1"
            }
        ]
    }
}
```

#### 4. DELETE /playlists/{id} - Hapus Playlist (Hanya Owner)
**Request:**
```
DELETE http://localhost:5000/playlists/{playlistId_user1}
Authorization: Bearer {accessToken_user1}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Playlist berhasil dihapus"
}
```

### H. Testing Playlist Songs (Memerlukan Authentication)

#### 1. POST /playlists/{id}/songs - Tambah Lagu ke Playlist
**Request:**
```json
POST http://localhost:5000/playlists/{playlistId}/songs
Content-Type: application/json
Authorization: Bearer {accessToken_owner}

{
    "songId": "{songId_from_songs_test}"
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Lagu berhasil ditambahkan ke playlist"
}
```

#### 2. GET /playlists/{id}/songs - Dapatkan Lagu dalam Playlist
**Request:**
```
GET http://localhost:5000/playlists/{playlistId}/songs
Authorization: Bearer {accessToken_owner}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "playlist": {
            "id": "playlist-xxxxxxxxxxxxx",
            "name": "My Favorite Songs",
            "username": "testuser1",
            "songs": [
                {
                    "id": "song-xxxxxxxxxxxxx",
                    "title": "Lagu Test 1",
                    "performer": "Performer Test"
                }
            ]
        }
    }
}
```

#### 3. DELETE /playlists/{id}/songs - Hapus Lagu dari Playlist
**Request:**
```json
DELETE http://localhost:5000/playlists/{playlistId}/songs
Content-Type: application/json
Authorization: Bearer {accessToken_owner}

{
    "songId": "{songId_to_remove}"
}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Lagu berhasil dihapus dari playlist"
}
```

### I. Testing Collaborations (Fitur Opsional)

#### 1. POST /collaborations - Tambah Kolaborator
**Request:**
```json
POST http://localhost:5000/collaborations
Content-Type: application/json
Authorization: Bearer {accessToken_owner}

{
    "playlistId": "{playlistId_owner}",
    "userId": "{userId_collaborator}"
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Kolaborasi berhasil ditambahkan",
    "data": {
        "collaborationId": "collab-xxxxxxxxxxxxx"
    }
}
```

#### 2. GET /playlists - Verifikasi Kolaborator Melihat Playlist
**Request:**
```
GET http://localhost:5000/playlists
Authorization: Bearer {accessToken_collaborator}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "playlists": [
            {
                "id": "playlist-xxxxxxxxxxxxx",
                "name": "My Favorite Songs",
                "username": "testuser1"
            }
        ]
    }
}
```

#### 3. POST /playlists/{id}/songs - Kolaborator Tambah Lagu
**Request:**
```json
POST http://localhost:5000/playlists/{playlistId}/songs
Content-Type: application/json
Authorization: Bearer {accessToken_collaborator}

{
    "songId": "{songId_from_songs_test}"
}
```

#### 4. DELETE /collaborations - Hapus Kolaborator
**Request:**
```json
DELETE http://localhost:5000/collaborations
Content-Type: application/json
Authorization: Bearer {accessToken_owner}

{
    "playlistId": "{playlistId_owner}",
    "userId": "{userId_collaborator}"
}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Kolaborasi berhasil dihapus"
}
```

### J. Testing Playlist Activities (Fitur Opsional)

#### 1. GET /playlists/{id}/activities - Lihat Aktivitas Playlist
**Request:**
```
GET http://localhost:5000/playlists/{playlistId}/activities
Authorization: Bearer {accessToken_owner}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "playlistId": "playlist-xxxxxxxxxxxxx",
        "activities": [
            {
                "username": "testuser1",
                "title": "Lagu Test 1",
                "action": "add",
                "time": "2025-01-09T10:00:00.000Z"
            },
            {
                "username": "testuser2",
                "title": "Lagu Test 2",
                "action": "add",
                "time": "2025-01-09T10:05:00.000Z"
            },
            {
                "username": "testuser1",
                "title": "Lagu Test 1",
                "action": "delete",
                "time": "2025-01-09T10:10:00.000Z"
            }
        ]
    }
}
```

### K. Testing Authorization & Error Cases

#### 1. Akses Playlist Tanpa Token
**Request:**
```
GET http://localhost:5000/playlists
```

**Expected Response (401):**
```json
{
    "status": "fail",
    "message": "Missing authentication"
}
```

#### 2. Akses Playlist Orang Lain
**Request:**
```
GET http://localhost:5000/playlists/{playlist_user2}/songs
Authorization: Bearer {accessToken_user1}
```

**Expected Response (403):**
```json
{
    "status": "fail",
    "message": "Anda tidak berhak mengakses resource ini"
}
```

#### 3. Hapus Playlist Orang Lain
**Request:**
```
DELETE http://localhost:5000/playlists/{playlist_user2}
Authorization: Bearer {accessToken_user1}
```

**Expected Response (403):**
```json
{
    "status": "fail",
    "message": "Anda tidak berhak mengakses resource ini"
}
```

#### 4. Tambah Kolaborator Bukan Owner
**Request:**
```json
POST http://localhost:5000/collaborations
Content-Type: application/json
Authorization: Bearer {accessToken_user2}

{
    "playlistId": "{playlist_user1}",
    "userId": "{userId_user2}"
}
```

**Expected Response (403):**
```json
{
    "status": "fail",
    "message": "Anda tidak berhak mengakses resource ini"
}
```

#### 5. Login dengan Kredensial Salah
**Request:**
```json
POST http://localhost:5000/authentications
Content-Type: application/json

{
    "username": "testuser1",
    "password": "wrongpassword"
}
```

**Expected Response (401):**
```json
{
    "status": "fail",
    "message": "Kredensial yang Anda berikan salah"
}
```

---

## Checklist Pengujian

### Fitur Basic (v1)
- [ ] POST /albums berhasil menambahkan album
- [ ] GET /albums/{id} menampilkan detail album dengan array songs
- [ ] PUT /albums/{id} berhasil mengupdate album
- [ ] DELETE /albums/{id} berhasil menghapus album
- [ ] POST /songs berhasil menambahkan lagu tanpa album
- [ ] POST /songs berhasil menambahkan lagu dengan album
- [ ] POST /songs gagal jika albumId tidak valid
- [ ] GET /songs menampilkan semua lagu
- [ ] GET /songs dengan filter title berfungsi
- [ ] GET /songs dengan filter performer berfungsi
- [ ] GET /songs/{id} menampilkan detail lagu lengkap
- [ ] PUT /songs/{id} berhasil mengupdate lagu
- [ ] DELETE /songs/{id} berhasil menghapus lagu
- [ ] Error 404 untuk resource yang tidak ditemukan
- [ ] Error 400 untuk payload yang tidak valid
- [ ] Cascade delete: menghapus album menghapus lagu-lagunya

### Fitur Authentication & Users (v2)
- [ ] POST /users berhasil registrasi user baru
- [ ] POST /users gagal jika username sudah digunakan
- [ ] POST /users gagal jika payload tidak valid
- [ ] POST /authentications berhasil login user
- [ ] POST /authentications gagal jika kredensial salah
- [ ] PUT /authentications berhasil refresh access token
- [ ] DELETE /authentications berhasil logout user

### Fitur Playlists (v2)
- [ ] POST /playlists berhasil membuat playlist (authenticated)
- [ ] GET /playlists menampilkan playlist user (authenticated)
- [ ] DELETE /playlists berhasil menghapus playlist (owner only)
- [ ] POST /playlists/{id}/songs berhasil menambah lagu ke playlist
- [ ] GET /playlists/{id}/songs menampilkan lagu dalam playlist
- [ ] DELETE /playlists/{id}/songs berhasil menghapus lagu dari playlist
- [ ] Error 401 untuk request tanpa authentication
- [ ] Error 403 untuk akses playlist orang lain

### Fitur Collaborations (v2 - Opsional)
- [ ] POST /collaborations berhasil menambah kolaborator (owner only)
- [ ] DELETE /collaborations berhasil menghapus kolaborator (owner only)
- [ ] Kolaborator dapat melihat playlist di GET /playlists
- [ ] Kolaborator dapat menambah/hapus lagu playlist
- [ ] Error 403 jika non-owner mencoba mengelola kolaborasi

### Fitur Activities (v2 - Opsional)
- [ ] GET /playlists/{id}/activities menampilkan riwayat aktivitas
- [ ] Activity tercatat saat menambah lagu ke playlist
- [ ] Activity tercatat saat menghapus lagu dari playlist
- [ ] Activity menampilkan username, title lagu, action, dan time
- [ ] Error 403 jika non-owner/collaborator mengakses activities

### Fitur Album Cover Upload (v3)
- [ ] POST /albums/{id}/covers berhasil upload cover valid
- [ ] GET /albums/{id} menampilkan coverUrl setelah upload
- [ ] POST /albums/{id}/covers gagal jika file > 512KB (413)
- [ ] POST /albums/{id}/covers gagal jika file bukan gambar (400)
- [ ] POST /albums/{id}/covers gagal jika tidak ada file (400)
- [ ] GET /upload/images/{filename} menampilkan gambar
- [ ] GET /upload/images/nonexistent.jpg menghasilkan 404

### Fitur Album Likes (v3)
- [ ] POST /albums/{id}/likes berhasil like album (authenticated)
- [ ] GET /albums/{id}/likes menampilkan jumlah likes
- [ ] POST /albums/{id}/likes gagal jika sudah like (400)
- [ ] DELETE /albums/{id}/likes berhasil unlike album
- [ ] DELETE /albums/{id}/likes gagal jika belum like (400)
- [ ] POST /albums/{id}/likes gagal tanpa authentication (401)

### Fitur Playlist Export (v3)
- [ ] POST /export/playlists/{id} berhasil request export
- [ ] Email dengan attachment JSON diterima
- [ ] POST /export/playlists/{id} gagal tanpa authentication (401)
- [ ] POST /export/playlists/{id} gagal jika bukan owner/collaborator (403)
- [ ] POST /export/playlists/{id} gagal jika email tidak valid (400)

### Fitur Caching (v3)
- [ ] GET /albums/{id}/likes pertama kali tanpa X-Data-Source: cache
- [ ] GET /albums/{id}/likes kedua kali dengan X-Data-Source: cache
- [ ] Cache invalidated setelah POST /albums/{id}/likes
- [ ] Cache invalidated setelah DELETE /albums/{id}/likes

### Testing Authorization
- [ ] Request tanpa token menghasilkan 401
- [ ] Request dengan token invalid menghasilkan 401
- [ ] Request dengan token expired menghasilkan 401
- [ ] Non-owner tidak bisa hapus playlist (403)
- [ ] Non-owner tidak bisa tambah kolaborator (403)
- [ ] Non-collaborator tidak bisa akses playlist (403)
- [ ] Non-owner/collaborator tidak bisa export playlist (403)

## Tips Testing & Debugging

### 1. Testing Flow yang Disarankan
1. **Persiapan Data**: Buat album dan lagu untuk testing playlist
2. **User Management**: Registrasi 2+ user untuk testing kolaborasi
3. **Authentication**: Login semua user, simpan token
4. **Album Cover Upload**: Test upload cover untuk album
5. **Album Likes**: Test like/unlike functionality
6. **Playlist Basic**: Buat, edit, hapus playlist
7. **Playlist Songs**: Tambah/hapus lagu dari playlist
8. **Collaboration**: Test kolaborasi antar user
9. **Activities**: Verifikasi pencatatan aktivitas
10. **Playlist Export**: Test export playlist ke email
11. **Caching**: Test caching behavior pada likes
12. **Authorization**: Test semua skenario error

### 2. Postman Environment Setup
Buat environment variables di Postman:
- `baseUrl`: `http://localhost:5000`
- `accessToken1`: Token user pertama
- `accessToken2`: Token user kedua
- `refreshToken1`: Refresh token user pertama
- `userId1`: ID user pertama
- `userId2`: ID user kedua
- `playlistId1`: ID playlist user pertama
- `songId1`: ID lagu untuk testing
- `albumId1`: ID album untuk testing
- `targetEmail`: Email untuk testing export

### 3. Testing Automation dengan Postman
Gunakan Tests tab di Postman untuk otomasi:
```javascript
// Simpan token setelah login
pm.test("Login successful", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    pm.environment.set("accessToken1", jsonData.data.accessToken);
});

// Simpan ID setelah create resource
pm.test("Playlist created", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    pm.environment.set("playlistId1", jsonData.data.playlistId);
});

// Test cache header
pm.test("Response from cache", function () {
    pm.response.to.have.header("X-Data-Source", "cache");
});
```

### 4. Debugging Tips
1. **Cek Logs Server**: Pastikan tidak ada error di console server
2. **Cek Database**: Gunakan SQL client untuk verifikasi data
3. **Network Tab**: Cek request/response di browser dev tools
4. **Token Expiry**: Access token expire setelah 1 jam
5. **Database Consistency**: Jalankan cleanup script sebelum testing
6. **CORS Issues**: Pastikan origin diizinkan jika test via browser
7. **File Upload**: Pastikan file size < 512KB dan format valid
8. **Cache Verification**: Periksa Redis untuk cache entries
9. **Email Delivery**: Periksa spam folder untuk email export
10. **Consumer Service**: Pastikan consumer service berjalan untuk export

### 5. Common Issues & Solutions
- **401 Unauthorized**: Periksa access token, mungkin expired
- **403 Forbidden**: Periksa ownership/collaboration access
- **404 Not Found**: Periksa ID resource masih valid
- **400 Bad Request**: Periksa payload sesuai schema
- **500 Internal Server Error**: Periksa logs server dan database connection
- **413 Payload Too Large**: File upload > 512KB, compress image
- **Upload Failed**: Periksa multipart/form-data format
- **No Email Received**: Periksa consumer service dan SMTP config
- **Cache Not Working**: Periksa Redis connection dan service

### 6. Performance Testing
- Test dengan multiple concurrent users
- Test dengan playlist yang berisi banyak lagu
- Test dengan banyak kolaborator dalam satu playlist
- Test upload multiple cover images
- Test cache performance dengan high load
- Test export dengan playlist berisi banyak lagu
- Monitor memory usage dan database connections
- Monitor Redis cache hit ratio

### 7. Testing External Services
- **Redis**: Test caching dengan Redis down
- **RabbitMQ**: Test export dengan RabbitMQ down
- **SMTP**: Test export dengan SMTP config salah
- **File System**: Test upload dengan disk space penuh
- **Database**: Test dengan database connection loss

### 8. Security Testing
- Test upload file executable (.exe, .bat)
- Test upload file dengan content malicious
- Test SQL injection pada filter parameters
- Test XSS pada payload fields
- Test file path traversal pada upload
- Test rate limiting pada API endpoints
- Test token manipulation dan forgery

---

## Testing Fitur Baru OpenMusic API v3

### L. Testing Album Cover Upload

#### 1. POST /albums/{id}/covers - Upload Cover Album (Valid)
**Request (using Postman):**
```
POST http://localhost:5000/albums/{albumId}/covers
Content-Type: multipart/form-data
Body: form-data
- cover: [Select image file, max 512KB, jpeg/png/gif]
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Sampul berhasil diunggah"
}
```

#### 2. GET /albums/{id} - Verifikasi Cover URL
**Request:**
```
GET http://localhost:5000/albums/{albumId}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "album": {
            "id": "album-xxxxxxxxxxxxx",
            "name": "Album Test",
            "year": 2023,
            "coverUrl": "http://localhost:5000/upload/images/1234567890cover.jpg",
            "songs": []
        }
    }
}
```

#### 3. POST /albums/{id}/covers - Upload File Too Large
**Request:**
```
POST http://localhost:5000/albums/{albumId}/covers
Content-Type: multipart/form-data
Body: form-data
- cover: [Select image file > 512KB]
```

**Expected Response (413):**
```json
{
    "status": "fail",
    "message": "Payload content length greater than maximum allowed: 512000"
}
```

#### 4. POST /albums/{id}/covers - Upload Invalid File Type
**Request:**
```
POST http://localhost:5000/albums/{albumId}/covers
Content-Type: multipart/form-data
Body: form-data
- cover: [Select non-image file, e.g., .txt, .pdf]
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Tipe file tidak valid. Hanya file gambar yang diizinkan."
}
```

#### 5. POST /albums/{id}/covers - No File Uploaded
**Request:**
```
POST http://localhost:5000/albums/{albumId}/covers
Content-Type: multipart/form-data
Body: form-data
[No file selected]
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Cover tidak ditemukan"
}
```

### M. Testing Album Likes

#### 1. POST /albums/{id}/likes - Like Album (Authenticated)
**Request:**
```
POST http://localhost:5000/albums/{albumId}/likes
Authorization: Bearer {accessToken}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Album berhasil disukai"
}
```

#### 2. GET /albums/{id}/likes - Get Likes Count
**Request:**
```
GET http://localhost:5000/albums/{albumId}/likes
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "likes": 1
    }
}
```

**Note:** Response header should include `X-Data-Source: cache` after first request.

#### 3. POST /albums/{id}/likes - Like Same Album Again
**Request:**
```
POST http://localhost:5000/albums/{albumId}/likes
Authorization: Bearer {accessToken}
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Anda sudah menyukai album ini"
}
```

#### 4. DELETE /albums/{id}/likes - Unlike Album
**Request:**
```
DELETE http://localhost:5000/albums/{albumId}/likes
Authorization: Bearer {accessToken}
```

**Expected Response (200):**
```json
{
    "status": "success",
    "message": "Album berhasil batal disukai"
}
```

#### 5. DELETE /albums/{id}/likes - Unlike Album Not Liked
**Request:**
```
DELETE http://localhost:5000/albums/{albumId}/likes
Authorization: Bearer {accessToken}
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Anda belum menyukai album ini"
}
```

#### 6. POST /albums/{id}/likes - Like Without Authentication
**Request:**
```
POST http://localhost:5000/albums/{albumId}/likes
[No Authorization header]
```

**Expected Response (401):**
```json
{
    "status": "fail",
    "message": "Missing authentication"
}
```

### N. Testing Playlist Export

#### 1. POST /export/playlists/{id} - Export Playlist
**Request:**
```json
POST http://localhost:5000/export/playlists/{playlistId}
Content-Type: application/json
Authorization: Bearer {accessToken}

{
    "targetEmail": "your-email@gmail.com"
}
```

**Expected Response (201):**
```json
{
    "status": "success",
    "message": "Permintaan Anda sedang kami proses"
}
```

**Note:** Check your email for the exported playlist file.

#### 2. POST /export/playlists/{id} - Export Without Authentication
**Request:**
```json
POST http://localhost:5000/export/playlists/{playlistId}
Content-Type: application/json
[No Authorization header]

{
    "targetEmail": "your-email@gmail.com"
}
```

**Expected Response (401):**
```json
{
    "status": "fail",
    "message": "Missing authentication"
}
```

#### 3. POST /export/playlists/{id} - Export Other User's Playlist
**Request:**
```json
POST http://localhost:5000/export/playlists/{otherUserPlaylistId}
Content-Type: application/json
Authorization: Bearer {accessToken}

{
    "targetEmail": "your-email@gmail.com"
}
```

**Expected Response (403):**
```json
{
    "status": "fail",
    "message": "Anda tidak berhak mengakses resource ini"
}
```

#### 4. POST /export/playlists/{id} - Export Invalid Email
**Request:**
```json
POST http://localhost:5000/export/playlists/{playlistId}
Content-Type: application/json
Authorization: Bearer {accessToken}

{
    "targetEmail": "invalid-email"
}
```

**Expected Response (400):**
```json
{
    "status": "fail",
    "message": "Email tidak valid"
}
```

### O. Testing Caching Behavior

#### 1. GET /albums/{id}/likes - First Request (Database)
**Request:**
```
GET http://localhost:5000/albums/{albumId}/likes
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "likes": 1
    }
}
```

**Note:** Response header should NOT include `X-Data-Source: cache`.

#### 2. GET /albums/{id}/likes - Second Request (Cache)
**Request:**
```
GET http://localhost:5000/albums/{albumId}/likes
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "likes": 1
    }
}
```

**Note:** Response header should include `X-Data-Source: cache`.

#### 3. POST /albums/{id}/likes - Like Album (Cache Invalidation)
**Request:**
```
POST http://localhost:5000/albums/{albumId}/likes
Authorization: Bearer {accessToken}
```

#### 4. GET /albums/{id}/likes - After Like (Database Again)
**Request:**
```
GET http://localhost:5000/albums/{albumId}/likes
```

**Expected Response (200):**
```json
{
    "status": "success",
    "data": {
        "likes": 2
    }
}
```

**Note:** Response header should NOT include `X-Data-Source: cache` (cache was invalidated).

### P. Testing Static File Serving

#### 1. GET /upload/images/{filename} - Access Uploaded Cover
**Request:**
```
GET http://localhost:5000/upload/images/{filename_from_upload}
```

**Expected Response (200):**
- Should return the image file with correct content-type
- Should display the image in browser

#### 2. GET /upload/images/nonexistent.jpg - Access Non-existent File
**Request:**
```
GET http://localhost:5000/upload/images/nonexistent.jpg
```

**Expected Response (404):**
```json
{
    "status": "fail",
    "message": "File tidak ditemukan"
}
```
