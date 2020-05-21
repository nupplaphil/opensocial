import bcrypt from "bcrypt";

import {AggregateRoot} from "@core/domain/AggregateRoot";

import {User} from "@modules/user/domain/User";

import {OAuth2GrantType} from "./OAuth2GrantType";
import {InvalidGrant, InvalidRequest} from "./error";
import {Guard} from "@core/logic/Guard";
import {ClientCreatedEvent} from "./events";

export type OAuth2ClientProps = {
  clientId: string,
  user: User,

  name: string | ""
  clientSecret: Buffer,
  allowGrantTypes: OAuth2GrantType[],

  created?: Date,
  updated?: Date,
};

export class OAuth2Client extends AggregateRoot<OAuth2ClientProps>{
  private readonly _created: Date;
  private readonly _updated: Date;

  get id(): number {
    if (this._id === undefined) {
      throw new InvalidGrant('Client is not saved');
    } else {
      return this._id;
    }
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get user(): User {
    return this.props.user;
  }

  get name(): string {
    return this.props.name;
  }

  get clientSecret(): Buffer {
    return this.props.clientSecret;
  }

  get allowGrantTypes(): OAuth2GrantType[] {
    return this.props.allowGrantTypes;
  }

  get created(): Date {
    return this._created;
  }

  get updated(): Date {
    return this._updated;
  }

  private constructor(props: OAuth2ClientProps, id?: number) {
    super(props, id);
    this._created = props.created ? props.created : new Date();
    this._updated = props.updated ? props.updated : new Date();
  }

  async validateSecret(secret: string): Promise<boolean> {
    return await bcrypt.compare(secret, this.props.clientSecret.toString('utf-8'));
  }

  static async create(props: OAuth2ClientProps, id?: number): Promise<OAuth2Client> {

    const guardedProps = [
      { argument: props.user, argumentName: 'user' },
      { argument: props.clientSecret, argumentName: 'clientSecret' },
      { argument: props.clientId, argumentName: 'clientId' },

    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!guardResult.succeeded) {
      throw new InvalidRequest(guardResult.message);
    } else {
      const client = new OAuth2Client({
        ...props,
      }, id);

      const idWasProvided = !!id;
      if (!idWasProvided) {
        client.addDomainEvent(new ClientCreatedEvent(client));
      }

      return client;
    }
  }

  static fromClient(client: OAuth2Client, id?: number): OAuth2Client {
    return new OAuth2Client({
      ...client.props
    }, id);
  }
}
