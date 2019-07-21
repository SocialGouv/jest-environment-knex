//

declare module "knex/lib/util/parse-connection" {
  export default function (options: any): {
    client: string,
    connection: object,
  };
}
