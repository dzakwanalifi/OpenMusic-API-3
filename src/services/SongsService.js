// src/services/SongsService.js
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async _validateAlbumExists(albumId) {
    if (!albumId) return;
    
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  _mapDBToModel(song) {
    const {
      id, title, year, performer, genre, duration, album_id,
    } = song;

    return {
      id,
      title,
      year,
      performer,
      genre,
      duration,
      albumId: album_id,
    };
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    await this._validateAlbumExists(albumId);

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(params) {
    const { title, performer } = params;
    
    let queryText = 'SELECT id, title, performer FROM songs';
    const queryValues = [];

    if (title && performer) {
      queryText += ' WHERE title ILIKE $1 AND performer ILIKE $2';
      queryValues.push(`%${title}%`, `%${performer}%`);
    } else if (title) {
      queryText += ' WHERE title ILIKE $1';
      queryValues.push(`%${title}%`);
    } else if (performer) {
      queryText += ' WHERE performer ILIKE $1';
      queryValues.push(`%${performer}%`);
    }

    const result = await this._pool.query(queryText, queryValues);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return this._mapDBToModel(result.rows[0]);
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    await this._validateAlbumExists(albumId);

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;