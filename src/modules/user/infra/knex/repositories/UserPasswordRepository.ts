import bcrypt from "bcrypt";

import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";
import {UserPasswordRepositoryInterface} from "@modules/user/repositories/UserPasswordRepositoryInterface";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";
import {UserPasswordRecord} from "@modules/user/infra/knex/records/UserPasswordRecord";
import {User} from "@modules/user/domain";

export const createUserPassword = (passwordBuilder: CallType<QueryBuilder<UserPasswordRecord>>) => async (user: User, password: string): Promise<void> => {
  await passwordBuilder().insert({
    password: new Buffer(await bcrypt.hash(password, 12)),
    // eslint-disable-next-line @typescript-eslint/camelcase
    user_id: user.id,
  });
}

export const updateUserPassword = (passwordBuilder: CallType<QueryBuilder<UserPasswordRecord>>) => async (user: User, password: string): Promise<void> => {
  await passwordBuilder().update({
    password: new Buffer(await bcrypt.hash(password, 12)),
  }).where({
    // eslint-disable-next-line @typescript-eslint/camelcase
    user_id: user.id
  });
}

export const validateUserPassword = (passwordBuilder: CallType<QueryBuilder<UserPasswordRecord>>) => async (user: User, password: string): Promise<boolean> => {
  const passwords = await passwordBuilder()
    .select()
    .where({
      // eslint-disable-next-line @typescript-eslint/camelcase
    user_id: user.id
  }) as UserPasswordRecord[];

  const hashes = passwords.map((row: UserPasswordRecord) => row.password);

  for (const hash of hashes) {
    if (await bcrypt.compare(password, hash.toString('utf-8'))) {
      return true;
    }
  }

  return false;
}

export default async function (knex: PromiseCallType<Knex>): Promise<UserPasswordRepositoryInterface> {
  const locKnex = await knex();
  const userPassword = (): QueryBuilder => locKnex.table(TABLES.USERPASSWORD);

  return {
    create: createUserPassword(userPassword),
    update: updateUserPassword(userPassword),
    validate: validateUserPassword(userPassword)
  }
}
