import {GetInboxController} from './getInboxController';
import {GetInboxUseCase} from './getInboxUseCase';
import {UserRepository} from '../../infra/knex/UserRepository';
import {knex} from '@db';

const userRepo = new UserRepository(knex);
const getInboxUseCase = new GetInboxUseCase(userRepo);
const getInboxController = new GetInboxController(getInboxUseCase);

export {
  getInboxController
}
