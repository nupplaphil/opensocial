import {knex} from "@db";

import {UserRepositoryInterface} from "./UserRepositoryInterface";
import {UserPasswordRepositoryInterface} from "./UserPasswordRepositoryInterface";
import createUserRepository from "../infra/knex/repositories/UserRepository";
import createUserPassRepository from "../infra/knex/repositories/UserPasswordRepository";

const userPasswordRepository = createUserPassRepository(knex);
const userRepository = createUserRepository(knex, userPasswordRepository);

export {
  UserRepositoryInterface,
  UserPasswordRepositoryInterface,
  userRepository,
  userPasswordRepository
}
