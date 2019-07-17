# jest-environment-knex

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

> [knex](knexjs.org) environment in [Jest](https://github.com/facebook/jest)

## Install

```sh
$ npm install --save-dev jest-environment-knex
# or
$ yarn -D jest-environment-knex
```

## Usage

```js
const { knex } = global;

beforeAll(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

test("should list all tables", async () => {
  const query = `
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_catalog = ?
  `;
  const results = await knex.raw(query, [knex.client.database()]);
  expect(results.rows.map(row => row.table_name).sort()).toMatchSnapshot();
});
```

[npm-url]: https://npmjs.org/package/jest-environment-knex
[npm-image]: http://img.shields.io/npm/v/jest-environment-knex.svg
[travis-url]: http://travis-ci.org/douglasduteil/jest-environment-knex
[travis-image]: http://travis-ci.org/douglasduteil/jest-environment-knex.svg?branch=master
