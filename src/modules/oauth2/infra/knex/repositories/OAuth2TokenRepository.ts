import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {OAuth2Token} from "@modules/oauth2/domain";
import {OAuth2TokenRepositoryInterface} from "@modules/oauth2/repositories/OAuth2TokenRepositoryInterface";
import {OAuth2TokenRecord} from "@modules/oauth2/infra/knex/records";
import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories";
import {NotFound} from "@modules/oauth2/domain/error";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";

export const recordToModel = async(clientRepo: OAuth2ClientRepositoryInterface, record: OAuth2TokenRecord): Promise<OAuth2Token> => {
  const client = await clientRepo.getById(record.id);

  return OAuth2Token.create({
    accessToken: record.access_token,
    refreshToken: record.refresh_token,
    accessTokenExpires: record.access_token_expires,
    refreshTokenExpires: record.refresh_token_expires,
    tokenType: "bearer",
    client: client,
    user: client.user,
  }, record.id);
}

export const getTokenById = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>, clientRepo: OAuth2ClientRepositoryInterface) => async (id: number): Promise<OAuth2Token> => {
  const record = (await tokenBuilder().where({ id })) as OAuth2TokenRecord;

  if (!record) {
    throw new NotFound('Token not found');
  }

  return await recordToModel(clientRepo, record);
};

export const getTokenByToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>, clientRepo: OAuth2ClientRepositoryInterface, type: 'access' | 'refresh') => async (token: string): Promise<OAuth2Token> => {
  let query: QueryBuilder<OAuth2TokenRecord>;

  switch (type) {
    case "access":
    default:
      query = tokenBuilder().where({
        access_token: token
      }).andWhere('access_token_expires', '>', Date.now())
        .first();
      break;
    case "refresh":
      query = tokenBuilder().where({
        // eslint-disable-next-line @typescript-eslint/camelcase
        refresh_token: token
      }).andWhere('refresh_token_expires', '>', Date.now())
        .first();
      break;
  }

  const record = await query as OAuth2TokenRecord;

  if (!record) {
    throw new NotFound('Token not found');
  }

  return await recordToModel(clientRepo, record);
};

export const deleteToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>) => async (token: OAuth2Token): Promise<void> => {
  await tokenBuilder().delete().where({
    id: token.id
  })
}

export const saveToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>) => async (token: OAuth2Token): Promise<OAuth2Token> => {

  if (!token.isSaved) {
    const result = await tokenBuilder().insert({
      client_id: token.client.id,
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      user_id: token.user.id,
      access_token_expires: token.accessTokenExpires,
      refresh_token_expires: token.refreshTokenExpires,
      created_at: token.created,
    });

    return OAuth2Token.fromToken(token, result[0]);
  } else {
    return token;
  }
}

export default async function (knex: PromiseCallType<Knex>, clientRepo: Promise<OAuth2ClientRepositoryInterface>): Promise<OAuth2TokenRepositoryInterface> {
  const locKnex = await knex();
  const token = (): QueryBuilder => locKnex.table(TABLES.OAUTH2TOKEN);

  return {
    getById: getTokenById(token, await clientRepo),
    getByRefreshToken: getTokenByToken(token, await clientRepo, "refresh"),
    getByAccessToken: getTokenByToken(token, await clientRepo, "access"),
    save: saveToken(token),
    delete: deleteToken(token)
  }
}
