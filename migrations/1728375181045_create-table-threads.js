/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    body: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    date: {
      type: "TIMESTAMP",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("threads");
};
