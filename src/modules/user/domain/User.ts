import {UserEmail} from './UserEmail';
import {UserPassword} from './UserPassword';
import {AggregateRoot, UniqueEntityID} from "@core/domain";
import {UserId} from "@modules/user/domain/UserId";
import {Guard} from "@core/logic";
import {UserCreateEvent} from "@modules/user/domain/events/UserCreateEvent";

export type UserProps = {
  id: number;
  name: string;
  username: string;
  email: UserEmail;
  password: UserPassword;
  guid: string;
}

export class User extends AggregateRoot<UserProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get userId(): UserId {
    return UserId.caller(this.id);
  }

  get name(): string {
    return this.props.name;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get password(): UserPassword {
    return this.props.password;
  }

  get guid(): string {
    return this.props.guid;
  }

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static async create(props: UserProps, id?: UniqueEntityID): Promise<User> {
    const guardedProps = [
      {argument: props.name, argumentName: 'name'},
      {argument: props.username, argumentName: 'username'},
      {argument: props.email, argumentName: 'email'},
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    return new Promise((resolve, reject) => {
      if (!guardResult.succeeded) {
        reject(guardResult.message);
      } else {
        const user = new User({
          ...props
        }, id);

        const idWasProvided = !!id;

        if (!idWasProvided) {
          user.addDomainEvent(new UserCreateEvent(user));
        }

        resolve(user);
      }
    });
  }
}
