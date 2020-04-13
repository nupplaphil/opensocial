import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  return knex('users').del()
    // Inserts seed entries
    .then(() => knex('users').insert([
      {
        name: 'Shreyansh Pandey',
        username: 'labsvisual',
        password: 'password',
        email: 'me@isomr.co',
        guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
      },
    ]));
}
