/* eslint-disable camelcase */

exports.shorthands = { id: { type: 'VARCHAR(50)', primaryKey: true } }

exports.up = pgm => {
  pgm.createTable('albums', {
    id: 'id',
    name: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INTEGER',
      notNull: true
    }
  })

  pgm.createTable('songs', {
    id: 'id',
    title: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INTEGER',
      notNull: true
    },
    genre: {
      type: 'TEXT',
      notNull: true
    },
    performer: {
      type: 'TEXT',

      notNull: true
    },
    duration: {
      type: 'INTEGER'
    },
    album_id: {
      type: 'TEXT',
      references: '"albums"',
      onDelete: 'cascade'
    }
  })

  pgm.createIndex('songs', 'album_id')
}

exports.down = pgm => {
  pgm.dropTable('songs')
  pgm.dropTable('albums')
}
