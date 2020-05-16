import {UserType} from "./UserType";

export type User = {
  readonly id: number,
  readonly name: string,
  readonly username: string,
  readonly email: string,
  readonly guid: string,
  readonly type: UserType,
  readonly active: boolean,
  readonly created?: Date,
  readonly updated?: Date,
};

export type NewUser = Omit<User, 'id'>;
