import {User} from "@modules/user/domain";

export interface UserPasswordRepositoryInterface {
  create: (user: User, password: string) => Promise<void>;
  update: (user: User, password: string) => Promise<void>;
  validate: (user: User, password: string) => Promise<boolean>;
}
