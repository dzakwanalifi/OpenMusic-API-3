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
    const { id } = request.params;
    
    if (!request.payload) {
      const response = h.response({
        status: 'fail',
        message: 'Payload tidak boleh kosong',
      });
      response.code(400);
      return response;
    }

    const { cover } = request.payload;

    if (!cover) {
      const response = h.response({
        status: 'fail',
        message: 'Cover file is required',
      });
      response.code(400);
      return response;
    }

    if (!cover.hapi) {
      const response = h.response({
        status: 'fail',
        message: 'Invalid file format',
      });
      response.code(400);
      return response;
    }
    
    try {
      // Validate the image headers
      this._uploadsValidator.validateImageHeaders(cover.hapi.headers);
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(400);
      return response;
    }

    try {
      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      await this._service.addAlbumCoverById(id, fileLocation);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch {
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan saat mengunggah sampul',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AlbumsHandler;