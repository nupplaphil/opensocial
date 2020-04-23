import {BaseRepositoryInterface} from '@core/infra';
import {User} from '@modules/user/domain/User';

export interface UserRepositoryInterface extends BaseRepositoryInterface<User> {
  getFollower(entity: Partial<User>): Promise<User[]>;
}
