import {knex} from "@db";

import {UserRepositoryInterface} from "./UserRepositoryInterface";
import createUserRepository from "../infra/knex/repositories/UserRepository";

const userRepository = createUserRepository(knex);

export {
  UserRepositoryInterface,
  userRepository,
}
