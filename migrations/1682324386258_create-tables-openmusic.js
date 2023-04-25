/* eslint-disable camelcase */

exports.shorthands = undefined

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
      type: 'INTEGER',
      notNull: false
    },
    albumId: {
      type: 'TEXT',
      notNull: false,
      references: '"albums"',
      onDelete: 'cascade'
    }
  })

  pgm.createIndex('songs', 'albumId')
}

exports.down = pgm => {
  pgm.dropTable('songs')
  pgm.dropTable('albums')
}
