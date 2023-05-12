exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover_url: {
      type: 'TEXT',
      isNullable: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover_url');
};
