import {UserRepositoryInterface} from '@modules/user/repo/UserRepositoryInterface';
import {BaseRepository} from '@core/infra';
import {User} from '@modules/user/domain/User';
import {TABLES} from '@db';

export class UserRepository extends BaseRepository<User> implements UserRepositoryInterface {
  save(entity: User): Promise<boolean> {
    return Promise.resolve(false);
  }

  get(id: number): Promise<User> {
    return this.knex<User>(TABLES.USER).where(id).first<User>();
  }

  getFollower(entity: Partial<User>): Promise<User[]> {
    return this.knex<User>(TABLES.USER).where(entity);
  }
}
