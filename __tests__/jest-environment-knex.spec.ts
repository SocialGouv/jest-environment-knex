//

import "knex";
const { databaseName, knex } = global;

beforeAll(async () => {
  await knex.migrate.latest();
});

test("should expose an 'databaseName' on global", () => {
  expect(databaseName).toMatch(/jest_environment_knex_\w{16}/);
});

test("should read the lorem db", async () => {
  expect(await knex.select().from("lorem")).toMatchSnapshot(
    knex.client.config.client
  );
});
