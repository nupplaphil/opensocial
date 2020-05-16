import config from './environment';
import Knex from "knex";

const MIGRATION_TABLE = 'migrations';

const migratorConfig: Knex.MigratorConfig = {
  tableName: MIGRATION_TABLE,
  directory: './db',
};

const seedsConfig: Knex.SeedsConfig = {
  directory: './db/seeds',
};

export default function(): Knex.Config {
  const dbConfig = config.get('db');
  const dbConnection = config.get('db.connection');
  const dbPool = config.get('db.pool');

  switch (config.get('env')) {
    case 'development':
    case 'unit_test':
      return {
        client: dbConfig.client,
        connection: {
          filename: dbConnection.filename,
        },
        useNullAsDefault: true,
        migrations: migratorConfig,
        seeds: seedsConfig,
      };
    default:
      return {
        client: dbConfig.client,
        connection: {
          host: dbConnection.host,
          database: dbConnection.database,
          user: dbConnection.user,
          password: dbConnection.password,
          port: dbConnection.port,
        },
        pool: {
          min: dbPool.min,
          max: dbPool.max,
        },
        migrations: migratorConfig,
        seeds: seedsConfig,
      };
  }
}
