const autoBind = require('auto-bind').default;

class LikesHandler {
  constructor(likesService, albumsService) {
    this._likesService = likesService;
    this._albumsService = albumsService;
    autoBind(this);
  }

  async postLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    try {
      await this._albumsService.verifyAlbumExists(albumId);
      await this._likesService.addLikeToAlbum(userId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil menyukai album',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);
        return response;
      }
      
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

  async deleteLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    try {
      await this._albumsService.verifyAlbumExists(albumId);
      await this._likesService.deleteLikeFromAlbum(userId, albumId);

      return {
        status: 'success',
        message: 'Berhasil batal menyukai album',
      };
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);
        return response;
      }
      
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

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    try {
      await this._albumsService.verifyAlbumExists(albumId);
      const { count, fromCache } = await this._likesService.getAlbumLikesCount(albumId);

      const response = h.response({
        status: 'success',
        data: {
          likes: count,
        },
      });

      if (fromCache) {
        response.header('X-Data-Source', 'cache');
      }

      return response;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);
        return response;
      }
      
      throw error;
    }
  }
}

module.exports = LikesHandler;
