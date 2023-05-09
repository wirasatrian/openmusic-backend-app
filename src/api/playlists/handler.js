const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: request.auth.credentials.id,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const playlists = await this._playlistsService.getPlaylists(
      request.auth.credentials.id
    );
    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(
      id,
      request.auth.credentials.id
    );
    await this._playlistsService.deletePlaylistById(id);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    // check if song exists / valid
    const song = await this._songsService.getSongById(songId);

    // check if playlist exists with right owner / access
    await this._playlistsService.verifyPlaylistAccess(
      playlistId,
      request.auth.credentials.id
    );

    // add playlist activity
    await this._playlistsService.addPlaylistActivity(
      playlistId,
      songId,
      request.auth.credentials.id,
      'add'
    );

    // add song to playlist
    await this._playlistsService.addSongToPlaylist({
      playlistId,
      songId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(
      playlistId,
      request.auth.credentials.id
    );

    const playlist = await this._playlistsService.getPlaylistById(playlistId);

    const playlistSongs = await this._songsService.getSongs({
      playlistId: `${playlistId}`,
    });

    const songs = playlistSongs.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));

    return {
      status: 'success',
      data: {
        playlist: { ...playlist, songs: songs },
      },
    };
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    // check if song exists / valid
    const song = await this._songsService.getSongById(songId);

    // check if playlist exists with right owner / access
    await this._playlistsService.verifyPlaylistAccess(
      playlistId,
      request.auth.credentials.id
    );

    // add playlist activity
    await this._playlistsService.addPlaylistActivity(
      playlistId,
      songId,
      request.auth.credentials.id,
      'delete'
    );

    // delete song from playlist
    await this._playlistsService.deleteSongFromPlaylist({
      playlistId,
      songId,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;

    // check if playlist exists with right owner / access
    await this._playlistsService.verifyPlaylistAccess(
      playlistId,
      request.auth.credentials.id
    );

    const activities = await this._playlistsService.getPlaylistActivities(
      playlistId
    );

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities: activities,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
