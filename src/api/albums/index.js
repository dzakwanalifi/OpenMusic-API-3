// src/api/albums/index.js
const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    service, storageService, validator, uploadsValidator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      service,
      storageService,
      validator,
      uploadsValidator,
    );
    server.route(routes(albumsHandler));
  },
};