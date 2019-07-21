//

// HACK(douglasduteil): force typescript env.
// tslint:disable-next-line: no-var-requires
require("ts-node/register");

module.exports = {
  client: "pg",
  connection:
    process.env.POSTGRES_URL || "postgres://postgres@localhost/postgres",
  useNullAsDefault: true,

  migrations: {
    directory: require("path").join(__dirname, "../__fixtures__/migrations"),
    extension: "ts"
  }
};
