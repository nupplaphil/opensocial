const isEntity = (v: any): v is Entity<any> => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return v instanceof Entity;
}

export abstract class Entity<T> {
  protected constructor(protected readonly props: T, protected readonly _id?: number) {
  }

  get isSaved(): boolean {
    return !!this._id;
  }

  equals (object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id === object._id;
  }
}
