//import knexStringcase from 'knex-stringcase';
import Knex from "knex";

///@todo Remove static configuration
const configuration = {
  client: 'sqlite3',
    connection: {
    filename: './dev.sqlite3',
  },
} as import('knex').Config;

export type Transaction = Knex.Transaction;

export const knex = Knex(configuration);

export const TABLES: { [key: string] : string } = {
  USER: 'users'
};
