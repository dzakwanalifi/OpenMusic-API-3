// src/api/albums/handler.js
const autoBind = require('auto-bind').default;

class AlbumsHandler {
  constructor(service, storageService, validator, uploadsValidator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    try {
      const { id } = request.params;
      const { cover } = request.payload || {};

      if (!cover) {
        const response = h.response({
          status: 'fail',
          message: 'Cover tidak ditemukan',
        });
        response.code(400);
        return response;
      }

      const headers = cover.hapi ? cover.hapi.headers : cover.headers;
      
      if (!headers) {
        const response = h.response({
          status: 'fail',
          message: 'File headers tidak ditemukan',
        });
        response.code(400);
        return response;
      }

      this._uploadsValidator.validateImageHeaders(headers);

      const meta = cover.hapi ? cover.hapi : { filename: cover.filename || 'cover' };
      const filename = await this._storageService.writeFile(cover, meta);
      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      await this._service.addAlbumCoverById(id, fileLocation);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error.name === 'InvariantError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(400);
        return response;
      }
      
      throw error;
    }
  }
}

module.exports = AlbumsHandler;