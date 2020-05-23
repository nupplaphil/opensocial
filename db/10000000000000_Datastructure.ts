import * as Knex from 'knex';
import {TableBuilder} from 'knex';
import {TABLES} from "../src/infra/knex";

export async function up(knex: Knex): Promise<void> {
  function createUsersTable(usersTable: TableBuilder): void {
    // Primary key
    usersTable.increments();

    // Data
    usersTable.string('name', 50).notNullable();
    usersTable.string('username', 50).notNullable().unique();
    usersTable.string('usernameLower', 50).notNullable().unique();
    usersTable.string('password', 60);
    usersTable.string('email', 250).notNullable().unique();
    usersTable.uuid('uuid').notNullable().unique();
    usersTable.integer('type', 1).notNullable().defaultTo(1).comment('1 = user, 2 = app, 3 = group');
    usersTable.integer('active', 1).notNullable().defaultTo(1);

    usersTable.timestamps(true, true);
  }

  function createUserLogsTable(loginTable: TableBuilder): void {
    // Primary key
    loginTable.increments();

    // Data
    loginTable.integer('user_id').unsigned().notNullable();
    loginTable.string('ip');
    loginTable.string('headers');
    loginTable.boolean('success');
    loginTable.integer('event_type', 8).notNullable();
    loginTable.timestamp('created_at', {useTz: false}).notNullable().defaultTo(knex.fn.now());

    // Foreign Key
    loginTable.foreign('user_id').references('id').inTable('users');
  }

  function createLogTable(logTable: TableBuilder): void {
    // Primary key
    logTable.increments();

    // Data
    logTable.timestamp('created_at', {useTz: false}).notNullable().defaultTo(knex.fn.now());
    logTable.string('domain');
    logTable.enum('level', []).notNullable();
    logTable.string('message', 2048);
    logTable.jsonb('data').defaultTo('');
  }

  function createOAuth2ClientTable(clientTable: TableBuilder): void {
    clientTable.increments();

    clientTable.string('name', 50).defaultTo('');
    clientTable.string('client_id', 50).notNullable().unique();
    clientTable.string('client_secret', 60).notNullable();
    clientTable.string('allowed_grant_types', 69).notNullable().defaultTo('');
    clientTable.integer('user_id').unsigned().notNullable();

    clientTable.timestamps(true, true);

    clientTable.foreign('user_id').references('id').inTable(TABLES.USER);
  }

  function createOAuth2Token(tokenTable: TableBuilder): void {
    tokenTable.increments();

    tokenTable.integer('client_id', 50).unsigned().notNullable();
    tokenTable.integer('user_id').unsigned().notNullable();

    tokenTable.string('access_token', 2000).notNullable().unique();
    tokenTable.string('refresh_token', 50).notNullable().unique();
    tokenTable.date('access_token_expires').notNullable();
    tokenTable.date('refresh_token_expires').notNullable();

    tokenTable.timestamps(true, true);

    tokenTable.foreign('client_id').references('client_id').inTable(TABLES.OAUTH2CLIENT);
    tokenTable.foreign('user_id').references('id').inTable(TABLES.USER);
  }

  function createOAuth2RedirectUri(redirectTable: TableBuilder): void {
    redirectTable.increments();

    redirectTable.integer('client_id').unsigned().notNullable();
    redirectTable.string('uri', 300).notNullable();

    redirectTable.foreign('client_id').references('client_id').inTable(TABLES.OAUTH2CLIENT);
  }

  function createOAuth2Code(codeTable: TableBuilder): void {
    codeTable.increments();

    codeTable.integer('client_id').unsigned().notNullable();
    codeTable.integer('user_id').unsigned().notNullable();

    codeTable.string('code', 50).notNullable();
    codeTable.string('code_challenge', 50).notNullable();
    codeTable.string('code_challenge_method', 50).notNullable();

    codeTable.timestamp('created_at', {useTz: false}).notNullable().defaultTo(knex.fn.now());

    codeTable.foreign('client_id').references('client_id').inTable(TABLES.OAUTH2CLIENT);
    codeTable.foreign('user_id').references('id').inTable(TABLES.USER);
  }

  return knex
    .schema
    .createTable(TABLES.USER, createUsersTable)
    .createTable(TABLES.USERLOG, createUserLogsTable)
    .createTable(TABLES.LOG, createLogTable)
    .createTable(TABLES.OAUTH2CLIENT, createOAuth2ClientTable)
    .createTable(TABLES.OAUTH2TOKEN, createOAuth2Token)
    .createTable(TABLES.OAUTH2REDIRECTURI, createOAuth2RedirectUri)
    .createTable(TABLES.OAUTH2CODE, createOAuth2Code);
}

export async function down(knex: Knex): Promise<void> {
  // We use `..-ifExists` because we're not sure if the table's there.
  // Honestly, this is just a safety measure.
  return knex
    .schema
    .dropTableIfExists(TABLES.USER)
    .dropTableIfExists(TABLES.USERLOG)
    .dropTableIfExists(TABLES.LOG)
    .dropTableIfExists(TABLES.OAUTH2CLIENT)
    .dropTableIfExists(TABLES.OAUTH2TOKEN)
    .dropTableIfExists(TABLES.OAUTH2REDIRECTURI)
    .dropTableIfExists(TABLES.OAUTH2CODE);
}
