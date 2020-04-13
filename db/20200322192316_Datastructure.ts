import * as Knex from 'knex';
import { TableBuilder } from 'knex';

export async function up(knex: Knex): Promise<void> {
  function createUsersTable(usersTable: TableBuilder): void {
    // Primary key
    usersTable.increments();

    // Data
    usersTable.string('name', 50).notNullable();
    usersTable.string('username', 50).notNullable().unique();
    usersTable.string('email', 250).notNullable().unique();
    usersTable.string('password', 128).notNullable();
    usersTable.string('guid', 50).notNullable().unique();

    usersTable.timestamps(true, true);
  }

  return knex
    .schema
    .createTable('users', createUsersTable);
}

export async function down(knex: Knex): Promise<void> {
  // We use `..-ifExists` because we're not sure if the table's there.
  // Honestly, this is just a safety measure.
  return knex
    .schema
    .dropTableIfExists('users');
}
