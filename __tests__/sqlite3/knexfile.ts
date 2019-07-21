//

// HACK(douglasduteil): force typescript env.
require("ts-node/register");

module.exports = {
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  },
  useNullAsDefault: true,

  migrations: {
    directory: require("path").join(__dirname, "../__fixtures__/migrations"),
    extension: "ts"
  }
};
