import * as Knex from "knex";

declare global {
  namespace NodeJS {
    interface Global {
      knex: Knex;
      databaseName: string;
    }
  }
}
