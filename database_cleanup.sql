-- Script untuk membersihkan database sebelum pengujian
-- Jalankan script ini menggunakan psql atau GUI database Anda

-- Menghapus semua data dari tabel
-- RESTART IDENTITY akan mereset sequence jika ada
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

-- Atau jika Anda ingin menghapus data satu per satu:
-- DELETE FROM playlist_song_activities;
-- DELETE FROM collaborations;
-- DELETE FROM playlist_songs;
-- DELETE FROM playlists;
-- DELETE FROM authentications;
-- DELETE FROM users;
-- DELETE FROM songs;
-- DELETE FROM albums;

-- Untuk melihat data yang tersisa (harus kosong):
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_authentications FROM authentications;
-- SELECT COUNT(*) as total_playlists FROM playlists;
-- SELECT COUNT(*) as total_playlist_songs FROM playlist_songs;
-- SELECT COUNT(*) as total_collaborations FROM collaborations;
-- SELECT COUNT(*) as total_playlist_song_activities FROM playlist_song_activities;
-- SELECT COUNT(*) as total_songs FROM songs;
-- SELECT COUNT(*) as total_albums FROM albums;
