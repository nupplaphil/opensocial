import {UserType} from "./UserType";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {AggregateRoot} from "@core/domain/AggregateRoot";
import {Guard} from "@core/logic/Guard";

import {InvalidUser} from "./errors";
import {UserCreatedEvent} from "./events";
import {UserPassword} from "./UserPassword";

export type UserProps = {
  uuid: UniqueEntityID,
  name: string,
  username: string,
  password?: UserPassword
  email: string,
  type: UserType,
  active: boolean,

  created?: Date,
  updated?: Date,
};

export class User extends AggregateRoot<UserProps>{
  private readonly _created: Date;
  private readonly _updated: Date;

  get id(): number {
    if (this._id === undefined) {
      throw new InvalidUser('User is not saved');
    } else {
      return this._id;
    }
  }

  get name(): string {
    return this.props.name;
  }

  get username(): string {
    return this.props.username;
  }

  get password(): UserPassword | undefined {
    return this.props.password;
  }

  get email(): string {
    return this.props.email;
  }

  get type(): UserType {
    return this.props.type;
  }

  get active(): boolean {
    return this.props.active;
  }

  get created(): Date {
    return this._created;
  }

  get updated(): Date {
    return this._updated;
  }

  private constructor(props: UserProps, id?: number) {
    super(props, id, props.uuid);
    this._created = props.created ? props.created : new Date();
    this._updated = props.updated ? props.updated : new Date();
  }

  static async create(props: UserProps, id?: number): Promise<User> {

    const guardedProps = [
      { argument: props.name, argumentName: 'name' },
      { argument: props.email, argumentName: 'email' },
      { argument: props.username, argumentName: 'username' },
      { argument: props.type, argumentName: 'type' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!guardResult.succeeded) {
      throw new InvalidUser(guardResult.message);
    } else {
      const user = new User({
        ...props
      }, id);

      const idWasProvided = !!id;

      if (!idWasProvided) {
        user.addDomainEvent(new UserCreatedEvent(user));
      }

      return user;
    }
  }

  static fromUser(user: User, id?: number): User {
    return new User({
      ...user.props
    }, id);
  }
}
