const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapAlbumToModel } = require('../utils');
const CanNotMoreThanOnce = require('../exceptions/CanNotMoreThanOnceError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const cacheResponse = await this._pool.query(query);

    if (!cacheResponse.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return cacheResponse.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const cacheResponse = await this._pool.query(query);

    if (!cacheResponse.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return cacheResponse.rows.map(mapAlbumToModel)[0];
  }

  async editAlbumById(id, { name, year, coverUrl }) {
    let query;

    if (!coverUrl) {
      query = {
        text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
        values: [name, year, id],
      };
    } else {
      query = {
        text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
        values: [coverUrl, id],
      };
    }

    const cacheResponse = await this._pool.query(query);

    if (!cacheResponse.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui album. Id album tidak ditemukan'
      );
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const cacheResponse = await this._pool.query(query);

    if (!cacheResponse.rowCount) {
      throw new NotFoundError(
        'Gagal menghapus album. Id album tidak ditemukan'
      );
    }
  }

  async verifyLikeOnAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const cacheResponse = await this._pool.query(query);

    return cacheResponse.rowCount > 0;
  }

  async likeAlbum(userId, albumId) {
    const id = `la-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const cacheResponse = await this._pool.query(query);

    if (!cacheResponse.rowCount) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`albums:${albumId}`);
  }

  async cancelLikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const cacheResponse = await this._pool.query(query);

    if (!cacheResponse.rowCount) {
      throw new InvariantError('Like gagal dibatalkan');
    }

    await this._cacheService.delete(`albums:${albumId}`);
  }

  async countAlbumLikes(albumId) {
    try {
      const cacheResponse = await this._cacheService.get(`albums:${albumId}`);
      if (cacheResponse) {
        const parsedCacheResponse = JSON.parse(cacheResponse);

        const customResponse = {
          ...parsedCacheResponse,
          cache: true,
        };

        await this._cacheService.set(
          `albums:${albumId}`,
          JSON.stringify(customResponse)
        );
        return customResponse;
      }
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      const numberOfLikes = {
        likes: parseInt(result.rows[0].count),
      };

      await this._cacheService.set(
        `albums:${albumId}`,
        JSON.stringify(numberOfLikes)
      );

      return numberOfLikes;
    }
  }
}

module.exports = AlbumsService;
