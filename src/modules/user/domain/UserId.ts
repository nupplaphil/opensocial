import {Entity, UniqueEntityID} from '@core/domain';

export class UserId extends Entity<any>{
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }
}
