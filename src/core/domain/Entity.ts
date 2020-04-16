import { Logger } from '@core/util';
import { UniqueEntityID } from '@core/domain';

const isEntity = (v: any): v is Entity<any> => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return v instanceof Entity;
}

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected readonly _logger: Logger;
  readonly props: T;

  constructor(logger: Logger, props: T, id?: UniqueEntityID) {
    this._logger = logger;
    this._id = id ? id : new UniqueEntityID();
    this.props = props;
  }

  equals(object? : Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id.equals(object._id);
  }
}
