const autoBind = require('auto-bind');
const CanNotMoreThanOnceError = require('../../exceptions/CanNotMoreThanOnceError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsHandler {
  constructor(albumsService, songsService, s3StorageService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._s3StorageService = s3StorageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',

      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);

    const songs = await this._songsService.getSongs({ albumId: id });

    const partOfSongs = songs.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs: partOfSongs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postCoverAlbumHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateAlbumImageHeaders(cover.hapi.headers);

    const fileLocation = await this._s3StorageService.writeFile(
      cover,
      cover.hapi
    );

    await this._albumsService.editAlbumById(id, { coverUrl: fileLocation });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async LikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    // check if album exist
    const album = await this._albumsService.getAlbumById(albumId);

    // check if user already liked
    const ifExist = await this._albumsService.verifyLikeOnAlbum(
      userId,
      albumId
    );

    if (ifExist) {
      throw new CanNotMoreThanOnceError(
        'Album tidak bisa di-like lebih dari 1x'
      );
    }

    // add like
    await this._albumsService.likeAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album mendapatkan like',
    });
    response.code(201);
    return response;
  }

  async CancelLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    // check if album exist
    const album = await this._albumsService.getAlbumById(albumId);

    // check if user already liked
    const ifExist = await this._albumsService.verifyLikeOnAlbum(
      userId,
      albumId
    );

    if (!ifExist) {
      throw new NotFoundError('Like tidak ditemukan');
    }

    await this._albumsService.cancelLikeAlbum(userId, albumId);

    return {
      status: 'success',
      message: 'Like dibatalkan',
    };
  }

  async getNumberOfLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, cache } = await this._albumsService.countAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (cache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;
