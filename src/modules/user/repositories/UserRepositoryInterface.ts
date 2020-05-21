import {RepositoryInterface} from "@core/domain/RepositoryInterface";
import {User} from "@modules/user/domain/User";

export interface UserRepositoryInterface extends RepositoryInterface<User> {
  getActiveById: (id: number) => Promise<User>;
  getByUsername: (username: string) => Promise<User>;
}
