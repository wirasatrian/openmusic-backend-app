const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this._producerService = ProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    // validate payload
    await this._validator.validateExportPlaylistSongsPayload(request.payload);

    const { playlistId } = request.params;

    // verify playlist owner
    await this._playlistsService.verifyPlaylistOwner(
      playlistId,
      request.auth.credentials.id
    );

    // send message
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage(
      'export:playlistSongs',
      JSON.stringify(message)
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
