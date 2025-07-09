// src/server.js
require('dotenv').config();
const path = require('path');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

// Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// Storage
const StorageService = require('./services/StorageService');
const UploadsValidator = require('./validator/uploads');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/SongsService');
const SongsValidator = require('./validator/songs');

// Users
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Likes
const likes = require('./api/likes');
const LikesService = require('./services/LikesService');
const CacheService = require('./services/CacheService');

// Exports
const exportsPlugin = require('./api/exports');
const ProducerService = require('./services/ProducerService');
const ExportsValidator = require('./validator/exports');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const likesService = new LikesService(cacheService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/images'));

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
      files: {
        relativeTo: path.join(__dirname, 'api/albums/file'),
      },
    },
  });

  await server.register([
    {
      plugin: Inert,
    },
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        storageService,
        validator: AlbumsValidator,
        uploadsValidator: UploadsValidator,
      },
    },
    {
      plugin: songs,
      options: { service: songsService, validator: SongsValidator },
    },
    {
      plugin: users,
      options: { service: usersService, validator: UsersValidator },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: likes,
      options: {
        likesService,
        albumsService,
      },
    },
    {
      plugin: exportsPlugin,
      options: {
        producerService: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Log error details for debugging
      console.error('Error details:', {
        statusCode: response.output ? response.output.statusCode : 'unknown',
        message: response.message,
        stack: response.stack,
      });

      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (response.output && response.output.statusCode === 413) {
        const newResponse = h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 512000',
        });
        newResponse.code(413);
        return newResponse;
      }

      if (response.output && response.output.statusCode === 415) {
        const newResponse = h.response({
          status: 'fail',
          message: 'Unsupported media type. Please upload a valid image file.',
        });
        newResponse.code(400);
        return newResponse;
      }

      if (response.message && response.message.includes('Payload content length greater than maximum allowed')) {
        const newResponse = h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 512000',
        });
        newResponse.code(413);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();