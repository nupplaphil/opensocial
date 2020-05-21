import crypto from "crypto";
import config from "@config/environment";

import {Guard} from "@core/logic/Guard";
import {AggregateRoot} from "@core/domain/AggregateRoot";

import {User} from "@modules/user/domain/User";

import {OAuth2Client} from "./OAuth2Client";
import {InvalidGrant, InvalidRequest, UnauthorizedClient} from "./error";
import {TokenCreatedEvent, TokenRevokedEvent} from "./events";

export type OAuth2TokenProps = {
  client: OAuth2Client,
  user: User,

  tokenType: 'bearer',
  accessToken: string,
  refreshToken: string,
  accessTokenExpires: number,
  refreshTokenExpires: number,

  created?: Date,
  updated?: Date,
};

export class OAuth2Token extends AggregateRoot<OAuth2TokenProps>{
  private readonly _created: Date;

  get id(): number {
    if (this._id === undefined) {
      throw new InvalidGrant('Token is not saved');
    } else {
      return this._id;
    }
  }

  get client(): OAuth2Client {
    return this.props.client;
  }

  get user(): User {
    return this.props.user;
  }

  get tokenType(): string {
    return this.props.tokenType;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get accessTokenExpires(): number {
    return this.props.accessTokenExpires;
  }

  get refreshTokenExpires(): number {
    return this.props.refreshTokenExpires;
  }

  get created(): Date {
    return this._created;
  }

  private constructor(props: OAuth2TokenProps, id?: number) {
    super(props, id);
    this._created = props.created ? props.created : new Date();
  }

  createNewToken(client: OAuth2Client): Promise<OAuth2Token> {
    if (this.props.client.clientId !== client.clientId) {
      throw new UnauthorizedClient('The client_id associated with the refresh did not match with the authenticated client credentials');
    }

    this.addDomainEvent(new TokenRevokedEvent(this));

    return OAuth2Token.createForClient(client);
  }

  static async create(props: OAuth2TokenProps, id?: number): Promise<OAuth2Token> {

    const guardedProps = [
      { argument: props.user, argumentName: 'user' },
      { argument: props.client, argumentName: 'client' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!guardResult.succeeded) {
      throw new InvalidRequest(guardResult.message);
    } else {
      const token = new OAuth2Token({
        ...props,
      }, id);

      const idWasProvided = !!id;
      if (!idWasProvided) {
        token.addDomainEvent(new TokenCreatedEvent(token));
      }

      return token;
    }
  }

  static async createForClient(client: OAuth2Client): Promise<OAuth2Token> {
    return OAuth2Token.createForUser(client, client.user);
  }

  static async createForUser(client: OAuth2Client, user: User): Promise<OAuth2Token> {
    if (!user.active || !client.id) {
      throw new Error('Cannot generate token for inactive user.');
    }

    const expiryConfig = config.get('oauth2.expiry');

    return OAuth2Token.create({
      client: client,
      user: user,
      tokenType: "bearer",
      accessToken: crypto.randomBytes(32).toString('base64').replace('=', ''),
      refreshToken: crypto.randomBytes(32).toString('base64').replace('=', ''),
      accessTokenExpires: Math.floor(Date.now() / 1000) + expiryConfig.accessToken,
      refreshTokenExpires: Math.floor(Date.now() / 1000) + expiryConfig.refreshToken
    });
  }

  static fromToken(token: OAuth2Token, id?: number): OAuth2Token {
    return new OAuth2Token({
      ...token.props
    }, id);
  }
}
