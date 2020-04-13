import { User } from '@model/User';
import { knex, TABLES } from "@db/knex";

export type Users = {
  getUsers: (user: Partial<User>) => Promise<User>;
};

async function getUsers(user: Partial<User>): Promise<User> {
  return knex
    .select([
      'id',
      'name',
      'username',
      'email',
      'password',
      'guid',
      'created_at',
      'updated_at',
    ]).where(user)
    .from<User>(TABLES.USER)
    .first();
}

export const Users: Users = {
  getUsers: getUsers
}
