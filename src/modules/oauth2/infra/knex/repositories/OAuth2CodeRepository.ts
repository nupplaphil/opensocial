import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {UserRepositoryInterface} from "@modules/user/repositories/UserRepositoryInterface";
import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories";

import {OAuth2CodeRecord} from "@modules/oauth2/infra/knex/records";
import {OAuth2Code, OAuth2CodeChallengeMethod} from "@modules/oauth2/domain";
import {OAuth2CodesRepositoryInterface} from "@modules/oauth2/repositories";
import {NotFound} from "@modules/oauth2/domain/error";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";

export const getCodeByCode = (codeBuilder: CallType<QueryBuilder<OAuth2CodeRecord>>, clientRepo: OAuth2ClientRepositoryInterface, userRepo: UserRepositoryInterface) => async (code: string): Promise<OAuth2Code> => {
  const record = (await codeBuilder().where({
    // eslint-disable-next-line @typescript-eslint/camelcase
    code: code,
  }).first()) as OAuth2CodeRecord;

  if (!record) {
    throw new NotFound('Code not found');
  }

  return {
    id: record.id,
    code: record.code,
    client: await clientRepo.getByClient(record.client_id),
    user: await userRepo.getActiveById(record.user_id),
    created: record.created_at,
    codeChallenge: record.code_challenge,
    codeChallengeMethod: record.code_challenge_method as OAuth2CodeChallengeMethod,
  }
};

export const getCodeById = (recordBuilder: CallType<QueryBuilder<OAuth2CodeRecord>>, clientRepo: OAuth2ClientRepositoryInterface, userRepo: UserRepositoryInterface) => async (id: number): Promise<OAuth2Code> => {
  const record = await recordBuilder().where({id}).first() as OAuth2CodeRecord;

  return {
    id: record.id,
    client: await clientRepo.getByClient(record.client_id),
    user: await userRepo.getActiveById(record.user_id),
    code: record.code,
    created: record.created_at,
    codeChallenge: record.code_challenge,
    codeChallengeMethod: record.code_challenge_method as OAuth2CodeChallengeMethod,
  }
};


export const deleteCode = (codeBuilder: CallType<QueryBuilder<OAuth2CodeRecord>>) => async (code: OAuth2Code): Promise<void> => {
  await codeBuilder().delete().where({id: code.id});
}

export const createCode = (codeBuilder:  CallType<QueryBuilder<OAuth2CodeRecord>>) => async (code: OAuth2Code): Promise<OAuth2Code> => {
  const created = new Date();

  const result = await codeBuilder().insert({
    code: code.code,
    // eslint-disable-next-line @typescript-eslint/camelcase
    code_challenge: code.codeChallenge,
    // eslint-disable-next-line @typescript-eslint/camelcase
    code_challenge_method: code.codeChallengeMethod,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: code.client.clientId,
    // eslint-disable-next-line @typescript-eslint/camelcase
    user_id: code.user.id,
    // eslint-disable-next-line @typescript-eslint/camelcase
    created_at: created,
  });

  return {
    id: result[0],
    client: code.client,
    user: code.user,
    code: code.code,
    codeChallenge: code.codeChallenge,
    codeChallengeMethod: code.codeChallengeMethod,
    created: created,
  }
}

export default async function (knex: PromiseCallType<Knex>, clientRepo: Promise<OAuth2ClientRepositoryInterface>, userRepo: Promise<UserRepositoryInterface>): Promise<OAuth2CodesRepositoryInterface> {
  const locKnex = await knex();
  const code = (): QueryBuilder => locKnex.table(TABLES.OAUTH2CODE);

  return {
    getByCode: getCodeByCode(code, await clientRepo, await userRepo),
    getById: getCodeById(code, await clientRepo, await userRepo),
    create: createCode(code),
    delete: deleteCode(code),
  }
}
