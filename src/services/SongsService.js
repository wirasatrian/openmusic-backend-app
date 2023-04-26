/* eslint-disable no-template-curly-in-string */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../exceptions/InvariantError')
const NotFoundError = require('../exceptions/NotFoundError')
const { mapSongToModel } = require('../utils')

class SongsService {
  constructor () {
    this._pool = new Pool()
  }

  async addSong ({ title, year, genre, performer, duration, albumId }) {
    const id = nanoid(16)

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs ({ title, performer, albumId }) {
    let query

    if (title && performer) {
      query = {
        text: 'SELECT * FROM songs WHERE LOWER(title) like $1 AND LOWER(performer) like $2',
        values: [`%${title}%`, `%${performer}%`]
      }
    } else if (title) {
      query = {
        text: 'SELECT * FROM songs WHERE LOWER(title) like $1',
        values: [`%${title}%`]
      }
    } else if (performer) {
      query = {
        text: 'SELECT * FROM songs WHERE LOWER(performer) like $1',
        values: [`%${performer}%`]
      }
    } else if (albumId) {
      query = {
        text: 'SELECT * FROM songs WHERE album_id = $1',
        values: [albumId]
      }
    } else {
      query = {
        text: 'SELECT * FROM songs'
      }
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapSongToModel)
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapSongToModel)[0]
  }

  async editSongById (id, { title, year, genre, performer, duration, albumId }) {
    let query

    if ((duration) && (albumId)) {
      query = {
        text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
        values: [title, year, genre, performer, duration, albumId, id]
      }
    } else if (duration) {
      query = {
        text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5 WHERE id = $6 RETURNING id',
        values: [title, year, genre, performer, duration, id]
      }
    } else {
      query = {
        text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, album_id = $5 WHERE id = $6 RETURNING id',
        values: [title, year, genre, performer, albumId, id]
      }
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id lagu tidak ditemukan')
    }
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu. Id lagu tidak ditemukan')
    }
  }
}

module.exports = SongsService
