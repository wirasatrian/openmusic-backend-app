const mapSongToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapUserToModel = ({ user_id, username, password, fullname }) => ({
  userId: user_id,
  username,
  password,
  fullname,
});

const mapAlbumToModel = ({ id, name, year, cover_url }) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});

module.exports = { mapSongToModel, mapUserToModel, mapAlbumToModel };
