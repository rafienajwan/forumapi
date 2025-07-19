/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("comment_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    comment_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "comments(id)",
      onDelete: "cascade",
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

  // Create unique constraint to prevent duplicate likes
  pgm.addConstraint("comment_likes", "unique_comment_like", {
    unique: ["comment_id", "owner"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("comment_likes");
};
