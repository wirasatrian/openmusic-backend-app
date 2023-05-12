const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (
    server,
    { albumsService, songsService, s3StorageService, validator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      songsService,
      s3StorageService,
      validator
    );
    server.route(routes(albumsHandler));
  },
};
