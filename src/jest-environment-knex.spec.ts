//

//
// Inspired by NodeEnvironment jest tests
// https://github.com/facebook/jest/blob/v26.4.2/packages/jest-environment-node/src/__tests__/node_environment.test.ts
//

//

import type { Config } from "@jest/types";
import { when } from "jest-when";
import KnexEnvironment from "./jest-environment-knex";

const DEFAULT_PROJECT_CONFIG: Config.ProjectConfig = {
  testEnvironmentOptions: {},
} as any;

let knex = {
  raw: jest.fn(),
  destroy: jest.fn().mockResolvedValue(null),
  client: { config: {} },
};
jest.mock("knex", () => jest.fn().mockImplementation(() => knex));
import Knex from "knex";

beforeEach(() => {
  knex = {
    raw: jest.fn(),
    destroy: jest.fn().mockResolvedValue(null),
    client: { config: {} },
  };
  (Knex as any as jest.Mock<any, any>).mockClear();
});

test("should uses a copy of the process object", () => {
  const env1 = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);
  const env2 = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);

  expect(env1.global.process).not.toBe(env2.global.process);
});

test("should exposes process.on", () => {
  const env = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);

  expect(env.global.process.on).toBeDefined();
});

test("should exposes databaseName", () => {
  const env = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);

  expect(env.global.databaseName).toMatch(/^jest_environment_knex_\w{16}$/);
});

test("should exposes knex", async () => {
  const env = new KnexEnvironment({
    ...DEFAULT_PROJECT_CONFIG,
    testEnvironmentOptions: {
      connection: {},
    },
  });

  await env.setup();

  expect(knex.raw).toHaveBeenCalledWith("SELECT 1 as value");
  expect(knex.raw).toHaveBeenCalledWith(
    `CREATE DATABASE ${env.global.databaseName};`
  );
  expect(knex.destroy).toHaveBeenCalledTimes(1);

  expect(Knex).toHaveBeenCalledWith({
    connection: {
      database: env.global.databaseName,
    },
  });
  expect(env.global.knex).toBeDefined();
});

test("should exposes knex with connection string", async () => {
  const env = new KnexEnvironment({
    ...DEFAULT_PROJECT_CONFIG,
    testEnvironmentOptions: {
      connection:
        "postgresql://user:password@myproject.postgres.database.gouv.com/autodevops_xxx?sslmode=require",
    },
  });

  await env.setup();

  expect(knex.raw).toHaveBeenCalledWith("SELECT 1 as value");
  expect(knex.raw).toHaveBeenCalledWith(
    `CREATE DATABASE ${env.global.databaseName};`
  );
  expect(knex.destroy).toHaveBeenCalledTimes(1);

  expect(Knex).toHaveBeenCalledWith({
    connection:
      "postgresql://user:password@myproject.postgres.database.gouv.com/autodevops_xxx?sslmode=require",
  });
  expect(env.global.knex).toBeDefined();
});

test("fails if knex config heartbeat fail in setup", async () => {
  // given
  const env = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);
  when(knex.raw)
    .calledWith("SELECT 1 as value")
    .mockRejectedValue(new Error("Not healthy"));

  // when
  await expect(() => env.setup()).rejects.toThrowError(
    "[jest-environment-knex] Heartbeat check failure\nNot healthy"
  );

  // then
  expect(knex.raw).toHaveBeenCalledWith("SELECT 1 as value");
  expect(knex.raw).not.toHaveBeenCalledWith(
    `CREATE DATABASE ${env.global.databaseName};`
  );
  expect(knex.destroy).not.toHaveBeenCalled();

  expect(env.global.knex).not.toBeDefined();
});

test("should exposes knex (sqlite3)", async () => {
  const env = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);
  knex.client.config = { client: "sqlite3" };

  await env.setup();

  expect(knex.raw).toHaveBeenCalledWith("SELECT 1 as value");
  expect(knex.raw).toHaveBeenCalledTimes(1);
  expect(knex.destroy).toHaveBeenCalledTimes(1);

  expect(Knex).toHaveBeenCalledWith({
    connection: {
      database: env.global.databaseName,
      filename: `/tmp/${env.global.databaseName}.sqlite3`,
    },
  });
  expect(env.global.knex).toBeDefined();
});

test("should exposes knex with connection string (sqlite3)", async () => {
  const env = new KnexEnvironment({
    ...DEFAULT_PROJECT_CONFIG,
    testEnvironmentOptions: {
      connection:
        "postgresql://user:password@myproject.postgres.database.gouv.com/autodevops_xxx?sslmode=require",
    },
  });

  knex.client.config = { client: "sqlite3" };

  await env.setup();

  expect(knex.raw).toHaveBeenCalledWith("SELECT 1 as value");
  expect(knex.raw).toHaveBeenCalledTimes(1);
  expect(knex.destroy).toHaveBeenCalledTimes(1);

  expect(Knex).toHaveBeenCalledWith({
    connection:
      "postgresql://user:password@myproject.postgres.database.gouv.com/autodevops_xxx?sslmode=require",
  });
  expect(env.global.knex).toBeDefined();
});

test("should drop the tmp database on teardown", async () => {
  const env = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);
  (env.global as any).knex = knex;
  await env.teardown();
  expect(knex.raw).toHaveBeenCalledWith(
    `DROP DATABASE ${env.global.databaseName};`
  );
  expect(knex.raw).toHaveBeenCalledTimes(1);
  expect(Knex).toHaveBeenCalledWith({});
  expect(knex.destroy).toHaveBeenCalledTimes(2);
});

test("should skip teardown if no knex defined", async () => {
  const env = new KnexEnvironment(DEFAULT_PROJECT_CONFIG);
  expect(env.global.knex).not.toBeDefined();
  await env.teardown();
  expect(knex.destroy).toHaveBeenCalledTimes(0);
});
