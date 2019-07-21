//

// HACK(douglasduteil): force typescript env.
require("ts-node/register");

module.exports = {
  client: "pg",
  connection:
    process.env.POSTGRES_URL ||
    "postgresql://postgres:@localhost:5432/postgres",
  useNullAsDefault: true,

  migrations: {
    directory: require("path").join(__dirname, "../__fixtures__/migrations"),
    extension: "ts"
  }
};
