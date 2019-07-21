import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable("lorem", table => {
    table.increments("id").primary();
    table.string("text");
  });

  await knex("lorem").insert({
    text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit"
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable("lorem");
}
