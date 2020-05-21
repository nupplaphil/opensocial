import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {OAuth2ClientRepositoryInterface, OAuth2CodesRepositoryInterface} from "@modules/oauth2/repositories";

import {OAuth2CodeRecord} from "@modules/oauth2/infra/knex/records";
import {OAuth2Code, OAuth2CodeChallengeMethod} from "@modules/oauth2/domain";
import {NotFound} from "@modules/oauth2/domain/error";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";

export const recordToModel = async(clientRepo: OAuth2ClientRepositoryInterface, record: OAuth2CodeRecord): Promise<OAuth2Code> => {
  const client = await clientRepo.getByClient(record.client_id);

  return OAuth2Code.create({
    code: record.code,
    client: client,
    user: client.user,
    created: record.created_at,
    codeChallenge: record.code_challenge,
    codeChallengeMethod: record.code_challenge_method as OAuth2CodeChallengeMethod,
  }, record.id);
}

export const getCodeByCode = (codeBuilder: CallType<QueryBuilder<OAuth2CodeRecord>>, clientRepo: OAuth2ClientRepositoryInterface) => async (code: string): Promise<OAuth2Code> => {
  const record = (await codeBuilder().where({
    code: code,
  }).first()) as OAuth2CodeRecord;

  if (!record) {
    throw new NotFound('Code not found');
  }

  return await recordToModel(clientRepo, record);
};

export const getCodeById = (recordBuilder: CallType<QueryBuilder<OAuth2CodeRecord>>, clientRepo: OAuth2ClientRepositoryInterface) => async (id: number): Promise<OAuth2Code> => {
  const record = await recordBuilder().where({id}).first() as OAuth2CodeRecord;

  return await recordToModel(clientRepo, record);
};


export const deleteCode = (codeBuilder: CallType<QueryBuilder<OAuth2CodeRecord>>) => async (code: OAuth2Code): Promise<void> => {
  await codeBuilder().delete().where({id: code.id});
}

export const saveCode = (codeBuilder:  CallType<QueryBuilder<OAuth2CodeRecord>>) => async (code: OAuth2Code): Promise<OAuth2Code> => {

  if (!code.isSaved) {
    const result = await codeBuilder().insert({
      code: code.code,
      code_challenge: code.codeChallenge,
      code_challenge_method: code.codeChallengeMethod,
      client_id: code.client.clientId,
      user_id: code.user.id,
      created_at: code.created,
    });

    return OAuth2Code.fromCode(code, result[0]);
  } else {
    return code;
  }
}

export default async function (knex: PromiseCallType<Knex>, clientRepo: Promise<OAuth2ClientRepositoryInterface>): Promise<OAuth2CodesRepositoryInterface> {
  const locKnex = await knex();
  const code = (): QueryBuilder => locKnex.table(TABLES.OAUTH2CODE);

  return {
    getByCode: getCodeByCode(code, await clientRepo),
    getById: getCodeById(code, await clientRepo),
    save: saveCode(code),
    delete: deleteCode(code),
  }
}
