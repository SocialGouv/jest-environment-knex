//

import "knex";
import { join } from "path";
const { databaseName, knex } = global;

beforeAll(async () => {
  await knex.migrate.latest({
    directory: join(__dirname, "../../dist/migrations"),
    loadExtensions: ["js"]
  });
});

test("should expose an 'databaseName' on global", () => {
  expect(databaseName).toMatch(/jest_environment_knex_\w{16}/);
});

test("should read the lorem db", async () => {
  expect(await knex.select().from("knex_migrations_lock")).toMatchSnapshot();
});
