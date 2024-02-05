import { MikroORM, EntityLoader } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'quickesticket',
  type: 'mysql',
  clientUrl: 'mysql://agus:agus@localhost:3307/quickesticket',
  highlighter: new SqlHighlighter(),
  debug: true,
  allowGlobalContext: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: []
  }

})

export const entityManager = orm.em as EntityManager;
export const entityLoader = new EntityLoader(orm.em);

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  // await generator.dropSchema()
  // await generator.createSchema()
  await generator.updateSchema()
} 