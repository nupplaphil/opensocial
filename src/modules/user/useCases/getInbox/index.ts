import {GetInboxController} from './getInboxController';
import {GetInboxUseCase} from "@modules/user/useCases/getInbox/getInboxUseCase";
import {UserRepository} from "@modules/user/infra/knex/UserRepository";
import {knex} from '@db';

const userRepo = new UserRepository(knex);
const getInboxUseCase = new GetInboxUseCase(userRepo);
const getInboxController = new GetInboxController(getInboxUseCase);

export {
  getInboxController
}
