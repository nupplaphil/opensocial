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

const recordToModel = async(record: OAuth2ClientRecord, user: User): Promise<OAuth2Client> => {
  return await OAuth2Client.create({
    name: record.name,
    clientId: record.client_id,
    clientSecret: new Buffer(record.client_secret),
    user: user,
    allowGrantTypes: record.allow_grant_types.split(' ') as OAuth2GrantType[],
    updated: record.updated_at,
    created: record.created_at
  }, record.id);
};

export const getClientByClientId = (client:  CallType<QueryBuilder<OAuth2ClientRecord>>, userRepo: UserRepositoryInterface) => async (clientId: string): Promise<OAuth2Client> => {
  const record = (await client().where({
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: clientId
  }).first()) as OAuth2ClientRecord;

  if (!record) {
    throw new NotFound('Client not found');
  }

  return await recordToModel(record, await userRepo.getActiveById(record.user_id));
};

export const getClientById = (client:  CallType<QueryBuilder<OAuth2ClientRecord>>, userRepo: UserRepositoryInterface) => async (id: number): Promise<OAuth2Client> => {
  const record = (await client().where({id}).first()) as OAuth2ClientRecord;

  return await recordToModel(record, await userRepo.getActiveById(record.user_id));
};


export const deleteClient = (clientBuilder: () => QueryBuilder<OAuth2ClientRecord>) => async (client: OAuth2Client): Promise<void> => {
  await clientBuilder().delete().where({id: client.id});
}

export const saveClient = (clientBuilder: () => QueryBuilder<OAuth2ClientRecord>) => async (client: OAuth2Client): Promise<OAuth2Client> => {

  if (!client.isSaved) {
    const result = await clientBuilder().insert({
      name: client.name,
      client_id: client.clientId,
      client_secret: client.clientSecret.toString(),
      user_id: client.user.id,
      allow_grant_types: client.allowGrantTypes.join(' '),
      created_at: client.created,
      updated_at: client.updated,
    });

    return OAuth2Client.fromClient(client, result[0]);
  } else {
    const updated = new Date();

    await clientBuilder().update({
      name: client.name,
      client_secret: client.clientSecret.toString(),
      allow_grant_types: client.allowGrantTypes.join(' '),
      updated_at: updated,
    }).where({id: client.id});

    return OAuth2Client.create({
      allowGrantTypes: client.allowGrantTypes,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      created: client.created,
      name: client.name,
      updated: updated,
      user: client.user
    }, client.id);
  }
}

export default async function (knex: PromiseCallType<Knex>, userRepo: Promise<UserRepositoryInterface>): Promise<OAuth2ClientRepositoryInterface> {
  const locKnex = await knex();
  const client = (): QueryBuilder => locKnex.table(TABLES.OAUTH2CLIENT);

  return {
    getByClient: getClientByClientId(client, await userRepo),
    getById: getClientById(client, await userRepo),
    save: saveClient(client),
    delete: deleteClient(client),
  }
}
