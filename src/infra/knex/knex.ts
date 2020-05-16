//import knexStringcase from 'knex-stringcase';
import Knex from "knex";
import loadConfig from "../../config/knex";

export type Transaction = Knex.Transaction;

export const TABLES: { [key: string] : string } = {
  USER: 'users',
  USERPASSWORD: 'user_passwords',
  USERTOTP: 'user_totp',
  USERLOG: 'user_logs',
  LOG: 'logs',
  OAUTH2CLIENT: 'oauth2_clients',
  OAUTH2REDIRECTURI: 'oauth2_redirection_uris',
  OAUTH2TOKEN: 'oauth2_tokens',
  OAUTH2CODE: 'oauth2_codes',
};

export default async function(): Promise<Knex> {
  const knex = Knex(loadConfig());

  await knex.raw("SELECT datetime('now')");

  return knex;
}
