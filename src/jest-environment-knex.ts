//

import { Config, Global } from "@jest/types";
import Debug from "debug";
import NodeEnvironment from "jest-environment-node";
import Knex from "knex";
import parseConnection from "knex/lib/util/parse-connection";
import { tmpdir } from "os";
import { join } from "path";
import { uid } from "rand-token";
import { runInContext, Script } from "vm";

//

const debug = Debug("jest-environment-knex");

//

class KnexEnvironment extends NodeEnvironment {
  public global: Global.Global & { databaseName: string; knex: Knex };
  private destroyPromises: any = [];
  private options: Knex.Config;

  constructor(config: Config.ProjectConfig) {
    super(config);
    debug("super(config)");

    //

    const global = (this.global = runInContext(
      "this",

      // NOTE(douglasduteil): don't replace `Object.assign` by object spreading
      //
      // It's important to not spread the context so it keeps its object type
      // and doesn't become an plain object.
      // vm.runInContext requires the context to be of type vm.Context
      // see https://nodejs.org/dist/latest-v10.x/docs/api/vm.html#vm_vm_runincontext_code_contextifiedsandbox_options
      //
      // tslint:disable-next-line: prefer-object-spread
      Object.assign(this.context, config.testEnvironmentOptions)
    ));
    const prefix =
      config.testEnvironmentOptions.prefix || "jest-environment-knex";
    global.databaseName = `${prefix}_${uid(16).toLowerCase()}`;

    //

    this.options = config.testEnvironmentOptions;
  }

  public async setup() {
    debug("setup");
    await super.setup();
    debug("super.setup()");

    //

    debug("new Knex");
    const knex = Knex(this.options);

    switch (knex.client.config.client) {
      case "sqlite3":
        await this.createRandomDataFile();
        break;

      default:
        await this.createRandomDatabase(knex);
        break;
    }

    debug("setup");
  }

  public async teardown() {
    debug("teardown");
    this.lazyDestroy(this.global.knex);

    //

    switch (this.global.knex.client.config.client) {
      case "sqlite3":
        break;

      default:
        debug("new Knex");
        const knex = Knex(this.options);
        debug(`await knex.raw(DROP DATABASE ${this.global.databaseName});`);
        await knex.raw(`DROP DATABASE ${this.global.databaseName};`);
        debug("knex.destroy()");
        this.lazyDestroy(knex);
        break;
    }

    //

    await Promise.all(this.destroyPromises);

    //

    debug("super.teardown()");
    await super.teardown();
    debug("teardown");
  }

  public runScript(script: Script) {
    return super.runScript(script);
  }

  private async createRandomDataFile() {
    const filename = join(tmpdir(), this.global.databaseName + ".sqlite3");
    debug({ filename });
    const connection: {} =
      typeof this.options.connection === "string"
        ? parseConnection(this.options.connection)
        : this.options.connection;
    this.global.knex = Knex({
      ...this.options,
      connection: {
        ...connection,
        filename
      }
    });
  }

  private async createRandomDatabase(knex: Knex<any, unknown[]>) {
    debug(`await knex.raw(CREATE DATABASE ${this.global.databaseName});`);
    await knex.raw(`CREATE DATABASE ${this.global.databaseName};`);
    debug("knex.destroy()");
    this.lazyDestroy(knex);

    //

    const connection: {} =
      typeof this.options.connection === "string"
        ? parseConnection(this.options.connection)
        : this.options.connection;
    this.global.knex = Knex({
      ...this.options,
      connection: {
        ...connection,
        database: this.global.databaseName
      }
    });
  }

  private lazyDestroy(knex: Knex) {
    this.destroyPromises.push(
      ((knex.destroy() as any) as Promise<void>).then(
        debug.bind(null, "knex.destroyed"),
        // tslint:disable-next-line: no-console
        console.error
      )
    );
  }
}

module.exports = KnexEnvironment;
