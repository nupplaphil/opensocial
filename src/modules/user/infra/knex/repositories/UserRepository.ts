import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {UserRepositoryInterface} from "@modules/user/repositories/UserRepositoryInterface";
import {User, UserType} from "@modules/user/domain";
import {UserRecord} from "@modules/user/infra/knex/records/UserRecord";
import {InvalidUser} from "@modules/user/domain/errors/InvalidUser";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {UserPassword} from "@modules/user/domain/UserPassword";

const userTypeIntToUserType = (input: number): UserType => {
  switch (input) {
    case 1: return 'user';
    case 2: return 'app';
    case 3: return 'group';
    default:
      throw new Error('Unknown user type id: ' + input);
  }
}

const userTypeToInt = (input: UserType): number => {
  switch (input) {
    case 'user': return 1;
    case 'app': return 2;
    case 'group': return 3;
  }
};

const recordToModel = async (user: UserRecord): Promise<User> => {
  return User.create({
    name: user.name,
    email: user.email,
    username: user.username,
    password: user.password ? await UserPassword.create(user.password, true) : undefined,
    uuid: new UniqueEntityID(user.uuid),
    type: userTypeIntToUserType(user.type),
    active: !!user.active
  }, user.id);
};


export const getActiveUserById = (users: CallType<QueryBuilder<UserRecord>>) => async (id: number): Promise<User> => {
  if (id === null || id === undefined) {
    throw new InvalidUser('Invalid ID');
  }

  const query = users().select().where({
    id: id,
    active: 1
  }).first();

  const user = await query as UserRecord;

  if (!user) {
    throw new InvalidUser('Invalid User ID');
  }

  return await recordToModel(user);
}

export const getUserByUsername = (users: CallType<QueryBuilder<UserRecord>>) => async (username: string): Promise<User> => {
  if (username === null || username === undefined) {
    throw new InvalidUser('Invalid username');
  }

  const query = users().select().where({
    username: username
  }).first();

  const user = await query as UserRecord;

  if (!user) {
    throw new InvalidUser('Invalid username');
  }

  return await recordToModel(user);
}

export const getUserById = (users: CallType<QueryBuilder<UserRecord>>) => async (id: number): Promise<User> => {
  if (id === null || id === undefined) {
    throw new InvalidUser('Invalid ID');
  }

  const query = users().select().where({
    id: id
  }).first();

  const user = await query as UserRecord;

  if (!user) {
    throw new InvalidUser('Invalid ID');
  }

  return (await recordToModel(user));
}

export const saveUser = (users: CallType<QueryBuilder<UserRecord>>) => async (user: User): Promise<User> => {
  if (!user.isSaved) {
    const result = (await users().insert({
      email: user.email,
      name: user.name,
      username: user.username,
      password: user.password ? user.password.toString() : undefined,
      uuid: user.uuid.toString(),
      type: userTypeToInt(user.type),
      active: user.active ? 1 : 0,
      created_at: user.created,
      updated_at: user.updated,
    }))[0];

    return User.fromUser(user, result);
  } else {
    const updated = new Date();

    await users().update({
      email: user.email,
      name: user.name,
      updated_at: updated,
    }).where("id", user.id);

    return User.create({
      active: user.active,
      email: user.email,
      name: user.name,
      password: user.password,
      type: user.type,
      username: user.username,
      uuid: user.uuid,
      created: user.created,
      updated: updated,
    });
  }
}

export default async function (knex: PromiseCallType<Knex>): Promise<UserRepositoryInterface> {
  const locKnex = await knex();
  const users = (): QueryBuilder => locKnex.table(TABLES.USER);

  return {
    getActiveById: getActiveUserById(users),
    getById: getUserById(users),
    getByUsername: getUserByUsername(users),
    save: saveUser(users),
  }
}
