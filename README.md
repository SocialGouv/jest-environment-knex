# jest-environment-knex

[![Github Master CI Status](https://github.com/SocialGouv/jest-environment-knex/workflows/ci/badge.svg?branch=master)](https://github.com/SocialGouv/jest-environment-knex/actions/)
[![codecov](https://codecov.io/gh/SocialGouv/jest-environment-knex/branch/master/graph/badge.svg)](https://codecov.io/gh/SocialGouv/jest-environment-knex)
[![NPM version][npm-image]][npm-url]

> [knex](knexjs.org) environment in [Jest](https://github.com/facebook/jest)

Tested against SQlite3 and Postgres. [See `__tests__`](./__tests__)

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
  expect(results.rows.map((row) => row.table_name).sort()).toMatchSnapshot();
});
```

## Release policy

Releases are automaticly made through our [GitHub Actions](https://github.com/SocialGouv/jest-environment-knex/actions) strictly following the [Semantic Versioning](http://semver.org/) specification thanks to [semantic-release](https://github.com/semantic-release/semantic-release).

[npm-url]: https://npmjs.org/package/jest-environment-knex
[npm-image]: http://img.shields.io/npm/v/jest-environment-knex.svg
[travis-url]: http://travis-ci.com/SocialGouv/jest-environment-knex
[travis-image]: http://travis-ci.com/SocialGouv/jest-environment-knex.svg?branch=master
