const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportPlaylistSongsHandler,
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
