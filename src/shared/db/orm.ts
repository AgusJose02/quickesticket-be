import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import exp from "constants";

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'quickesticket',
  type: 'mysql',
  clientUrl: 'mysql://agus:agus@localhost:3307/quickesticket',
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: []
  }

})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  // await generator.dropSchema()
  // await generator.createSchema()
  await generator.updateSchema()
} 