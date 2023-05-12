exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(50)',
      unique: true,
      notNull: true,
    },
    owner: {
      type: 'TEXT',
    },
  });

  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner_users.user_id',
    'FOREIGN KEY(owner) REFERENCES users(user_id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
