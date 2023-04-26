const autoBind = require('auto-bind')
const SongsService = require('../../services/SongsService')
class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._service.addAlbum({ name, year })

    const response = h.response({
      status: 'success',

      data: {
        albumId
      }
    })
    response.code(201)
    return response
  }

  async getAlbumByIdHandler (request, h) {
    const songsService = new SongsService()

    const { id } = request.params

    const album = await this._service.getAlbumById(id)

    const songs = await songsService.getSongs({ albumId: id })

    const partOfSongs = songs.map(({ id, title, performer }) => ({ id, title, performer }))

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs: partOfSongs
        }
      }
    }
  }

  async putAlbumByIdHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)

    const { id } = request.params

    await this._service.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Album berhasil diperbarui'
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params

    await this._service.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    }
  }
}

module.exports = AlbumsHandler
