import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {UserRepositoryInterface} from "@modules/user/repositories/UserRepositoryInterface";
import {NewUser, User, UserType} from "@modules/user/domain";
import {UserRecord} from "@modules/user/infra/knex/records/UserRecord";
import {InvalidUser} from "@modules/user/domain/errors/InvalidUser";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";
import {UserPasswordRepositoryInterface} from "@modules/user/repositories";

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

const recordToModel = (user: UserRecord): User => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    guid: user.guid,
    created: new Date(user.created_at),
    updated: new Date(user.updated_at),
    type: userTypeIntToUserType(user.type),
    active: !!user.active
  } as User;
};


export const getActiveUserById = (users: CallType<QueryBuilder<UserRecord>>) => async (id: number): Promise<User> => {
  const query = users().select().where({
    id: id,
    active: 1
  }).first();

  const user = await query as UserRecord;

  if (!user) {
    throw new InvalidUser('Invalid User ID');
  }

  return recordToModel(user);
}

export const getValidUser = (users: CallType<QueryBuilder<UserRecord>>, passRepo: UserPasswordRepositoryInterface) => async (username: string, password: string): Promise<User> => {
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

  const userEntity = recordToModel(user);

  if (!await passRepo.validate(userEntity, password)) {
    throw new InvalidUser('Unknown username or password');
  }

  if (!userEntity.active) {
    throw new InvalidUser('User is inactive');
  }

  return userEntity;
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

  return (recordToModel(user));
}

export const createUser = (users: CallType<QueryBuilder<UserRecord>>) => async (user: NewUser): Promise<User> => {
  const result = (await users().insert({
    email: user.email,
    name: user.name,
    username: user.username,
    guid: user.guid,
    type: userTypeToInt(user.type),
    active: user.active ? 1 : 0
  }))[0];

  return {
    id: result,
    ...user
  } as User;
}

export const updateUser = (users: CallType<QueryBuilder<UserRecord>>) => async (user: User): Promise<User> => {
    await users().update({
      email: user.email,
      name: user.name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      updated_at: new Date(),
    }).where("id", user.id);

    return user;
}

export default async function (knex: PromiseCallType<Knex>, passRepo: Promise<UserPasswordRepositoryInterface>): Promise<UserRepositoryInterface> {
  const locKnex = await knex();
  const users = (): QueryBuilder => locKnex.table(TABLES.USER);

  return {
    getActiveById: getActiveUserById(users),
    getById: getUserById(users),
    getValidUser: getValidUser(users, await passRepo),
    create: createUser(users),
    update: updateUser(users)
  }
}
