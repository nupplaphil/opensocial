import Knex, {QueryBuilder} from "knex";
import {TABLES} from "@db";

import {UserRepositoryInterface} from "@modules/user/repositories/UserRepositoryInterface";

import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories/OAuth2ClientRepositoryInterface";
import {OAuth2ClientRecord} from "@modules/oauth2/infra/knex/records";
import {OAuth2Client} from "@modules/oauth2/domain";
import {User} from "@modules/user/domain";
import {NotFound} from "@modules/oauth2/domain/error";
import {OAuth2GrantType} from "@modules/oauth2/domain/OAuth2GrantType";
import {CallType, PromiseCallType} from "@core/usecase/PromiseCallType";

const recordToModel = (record: OAuth2ClientRecord, user: User): OAuth2Client => {
  return {
    id: record.id,
    name: record.name,
    clientId: record.client_id,
    clientSecret: new Buffer(record.client_secret),
    user: user,
    allowGrantTypes: record.allow_grant_types.split(' ') as OAuth2GrantType[],
    updated: record.updated_at,
    created: record.created_at
  }
};

const modelToModel = (client: OAuth2Client, id: number | undefined, created: Date | undefined, updated: Date): OAuth2Client => {
  return {
    id: id,
    name: client.name,
    clientId: client.clientId,
    allowGrantTypes: client.allowGrantTypes,
    clientSecret: client.clientSecret,
    user: client.user,
    created: created,
    updated: updated,
  }
};

export const getClientByClientId = (client:  CallType<QueryBuilder<OAuth2ClientRecord>>, userRepo: UserRepositoryInterface) => async (clientId: string): Promise<OAuth2Client> => {
  const record = (await client().where({
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: clientId
  }).first()) as OAuth2ClientRecord;

  if (!record) {
    throw new NotFound('Client not found');
  }

  return recordToModel(record, await userRepo.getActiveById(record.user_id));
};

export const getClientById = (client:  CallType<QueryBuilder<OAuth2ClientRecord>>, userRepo: UserRepositoryInterface) => async (id: number): Promise<OAuth2Client> => {
  const record = (await client().where({id}).first()) as OAuth2ClientRecord;

  return recordToModel(record, await userRepo.getActiveById(record.user_id));
};


export const deleteClient = (clientBuilder: () => QueryBuilder<OAuth2ClientRecord>) => async (client: OAuth2Client): Promise<void> => {
  await clientBuilder().delete().where({id: client.id});
}

export const createClient = (clientBuilder: () => QueryBuilder<OAuth2ClientRecord>) => async (client: OAuth2Client): Promise<OAuth2Client> => {
  const created = new Date();

  const result = await clientBuilder().insert({
    name: client.name,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: client.clientId,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_secret: client.clientSecret.toString(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    user_id: client.user.id,
    // eslint-disable-next-line @typescript-eslint/camelcase
    allow_grant_types: client.allowGrantTypes.join(' '),
    // eslint-disable-next-line @typescript-eslint/camelcase
    created_at: created,
    // eslint-disable-next-line @typescript-eslint/camelcase
    updated_at: created,
  });

  return modelToModel(client, result[0], created, created);
}

export const updateClient = (clientBuilder: () => QueryBuilder<OAuth2ClientRecord>) => async (client: OAuth2Client): Promise<OAuth2Client> => {
  const updated = new Date();

  await clientBuilder().update({
    name: client.name,
    client_secret: client.clientSecret.toString(),
    allow_grant_types: client.allowGrantTypes.join(' '),
    updated_at: updated,
  }).where({id: client.id});

  return modelToModel(client, client.id, client.created, updated);
}

export default async function (knex: PromiseCallType<Knex>, userRepo: Promise<UserRepositoryInterface>): Promise<OAuth2ClientRepositoryInterface> {
  const locKnex = await knex();
  const client = (): QueryBuilder => locKnex.table(TABLES.OAUTH2CLIENT);

  return {
    getByClient: getClientByClientId(client, await userRepo),
    getById: getClientById(client, await userRepo),
    create: createClient(client),
    update: updateClient(client),
    delete: deleteClient(client),
  }
}
