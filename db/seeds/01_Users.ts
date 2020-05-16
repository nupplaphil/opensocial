import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 1,
      name: 'Test User 1',
      username: 'testuser',
      email: 'me@isomr.co',
      guid: 'f03ede7c-b121-4112-bcc7-130a3487988c',
      active: 0,
      type: 1,
    },
    {
      id: 2,
      name: 'Test User 2',
      username: 'testuser2',
      email: 'me@isomr2.co',
      guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
      active: 1,
      type: 1,
    }
  ]);
  await knex('user_passwords').insert([
    {
      // eslint-disable-next-line @typescript-eslint/camelcase
      user_id: 1,
      password: 'password1',
    },
    {
      // eslint-disable-next-line @typescript-eslint/camelcase
      user_id: 2,
      password: 'password2',
    },
  ]);
}
