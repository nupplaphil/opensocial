import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {UserRepositoryInterface} from "@modules/user/repositories";

import {OAuth2Token} from "@modules/oauth2/domain";
import {OAuth2TokenRepositoryInterface} from "@modules/oauth2/repositories/OAuth2TokenRepositoryInterface";
import {OAuth2TokenRecord} from "@modules/oauth2/infra/knex/records";
import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories";
import {NotFound} from "@modules/oauth2/domain/error";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";

export const getTokenById = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>, clientRepo: OAuth2ClientRepositoryInterface, userRepo: UserRepositoryInterface) => async (id: number): Promise<OAuth2Token> => {
  const row = (await tokenBuilder().where({ id })) as OAuth2TokenRecord;

  if (!row) {
    throw new NotFound('Token not found');
  }

  return {
    id: row.id,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    accessTokenExpires: row.access_token_expires,
    refreshTokenExpires: row.refresh_token_expires,
    tokenType: "bearer",
    user: await userRepo.getActiveById(row.user_id),
    client: await clientRepo.getById(row.id),
    created: row.created_at,
    updated: row.updated_at,
  };
};

export const getTokenByToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>, clientRepo: OAuth2ClientRepositoryInterface, userRepo: UserRepositoryInterface, type: 'access' | 'refresh') => async (token: string): Promise<OAuth2Token> => {
  let query: QueryBuilder<OAuth2TokenRecord>;

  switch (type) {
    case "access":
    default:
      query = tokenBuilder().where({
        // eslint-disable-next-line @typescript-eslint/camelcase
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

  const row = await query as OAuth2TokenRecord;

  if (!row) {
    throw new NotFound('Token not found');
  }

  return {
    id: row.id,
    client: await clientRepo.getById(row.id),
    user: await userRepo.getActiveById(row.user_id),
    tokenType: "bearer",
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    accessTokenExpires: row.access_token_expires,
    refreshTokenExpires: row.refresh_token_expires,
    created: row.created_at,
    updated: row.updated_at,
  };
};

export const deleteToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>) => async (token: OAuth2Token): Promise<void> => {
  await tokenBuilder().delete().where({
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token: token.accessToken
  })
}

export const createToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>) => async (token: OAuth2Token): Promise<OAuth2Token> => {
  const created = new Date();

  const result = await tokenBuilder().insert({
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: token.client.id,
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token: token.accessToken,
    // eslint-disable-next-line @typescript-eslint/camelcase
    refresh_token: token.refreshToken,
    // eslint-disable-next-line @typescript-eslint/camelcase
    user_id: token.user.id,
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token_expires: token.accessTokenExpires,
    // eslint-disable-next-line @typescript-eslint/camelcase
    refresh_token_expires: token.refreshTokenExpires,
    // eslint-disable-next-line @typescript-eslint/camelcase
    created_at: created,
    // eslint-disable-next-line @typescript-eslint/camelcase
    updated_at: created,
  });

  return {
    id: result[0],
    client: token.client,
    user: token.user,
    tokenType: "bearer",
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpires: token.accessTokenExpires,
    refreshTokenExpires: token.refreshTokenExpires,
    created: created,
    updated: created,
  }
}

export const updateToken = (tokenBuilder: CallType<QueryBuilder<OAuth2TokenRecord>>) => async (token: OAuth2Token): Promise<OAuth2Token> => {
  const updated = new Date();

  await tokenBuilder().update({
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token_expires: token.accessTokenExpires,
    // eslint-disable-next-line @typescript-eslint/camelcase
    refresh_token_expires: token.refreshTokenExpires,
    // eslint-disable-next-line @typescript-eslint/camelcase
    updated_at: updated,
  }).where({id: token.id});

  return {
    id: token.id,
    client: token.client,
    user: token.user,
    tokenType: "bearer",
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpires: token.accessTokenExpires,
    refreshTokenExpires: token.refreshTokenExpires,
    created: token.created,
    updated: updated,
  };
}

export default async function (knex: PromiseCallType<Knex>, clientRepo: Promise<OAuth2ClientRepositoryInterface>, userRepo: Promise<UserRepositoryInterface>): Promise<OAuth2TokenRepositoryInterface> {
  const locKnex = await knex();
  const token = (): QueryBuilder => locKnex.table(TABLES.OAUTH2TOKEN);

  return {
    getById: getTokenById(token, await clientRepo, await userRepo),
    getByRefreshToken: getTokenByToken(token, await clientRepo, await userRepo, "refresh"),
    getByAccessToken: getTokenByToken(token, await clientRepo, await userRepo, "access"),
    create: createToken(token),
    update: updateToken(token),
    delete: deleteToken(token)
  }
}
