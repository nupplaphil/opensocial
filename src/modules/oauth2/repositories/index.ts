import {knex} from "@db";
import {userRepository} from "@modules/user/repositories";

import {OAuth2ClientRepositoryInterface} from "./OAuth2ClientRepositoryInterface";
import {OAuth2TokenRepositoryInterface} from "./OAuth2TokenRepositoryInterface";
import {OAuth2CodesRepositoryInterface} from "./OAuth2CodesRepositoryInterface";

import createClientRepository from "../infra/knex/repositories/OAuth2ClientRepository";
import createTokenRepository from "../infra/knex/repositories/OAuth2TokenRepository";
import createCodeRepository from "../infra/knex/repositories/OAuth2CodeRepository";

const oauth2ClientRepository = createClientRepository(knex, userRepository);
const oauth2TokenRepository = createTokenRepository(knex, oauth2ClientRepository);
const oauth2CodeRepository = createCodeRepository(knex, oauth2ClientRepository);

export {
  OAuth2ClientRepositoryInterface,
  OAuth2TokenRepositoryInterface,
  OAuth2CodesRepositoryInterface,
  oauth2ClientRepository,
  oauth2TokenRepository,
  oauth2CodeRepository,
}
