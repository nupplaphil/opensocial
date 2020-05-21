import crypto from "crypto";
import config from "@config/environment";

import {AggregateRoot} from "@core/domain/AggregateRoot";
import {Guard} from "@core/logic/Guard";

import {User} from "@modules/user/domain";

import {InvalidGrant, InvalidRequest, UnauthorizedClient} from "./error";
import {OAuth2Client} from "./OAuth2Client";
import {OAuth2CodeChallengeMethod} from "./OAuth2CodeChallengeMethod";
import {OAuth2Token} from "./OAuth2Token";
import {CodeCreatedEvent, CodeUsedEvent} from "./events";

export type OAuth2CodeProps = {
  client: OAuth2Client,
  user: User,

  code: string,
  codeChallenge?: string,
  codeChallengeMethod?: OAuth2CodeChallengeMethod,

  created?: Date,
};

export const validatePKCE = (codeVerifier: string | undefined, codeChallenge: string | undefined, codeChallengeMethod: OAuth2CodeChallengeMethod | undefined): void => {
  if (!codeChallenge && !codeVerifier) {
    // This request was not initiated with PKCE support, so ignore the validation
    return;
  } else if (codeChallenge && !codeVerifier) {
    // The authorization request started with PKCE, but the token request did not follow through
    throw new InvalidRequest('The code verifier was not supplied');
  } else if (codeChallenge && codeVerifier) {
    // For the plain method, the derived code and the code verifier are the same
    let derivedCodeChallenge = codeVerifier;

    if (codeChallengeMethod === 'S256') {
      derivedCodeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }

    if (codeChallenge !== derivedCodeChallenge) {
      throw new InvalidGrant('The code verifier does not match the code challenge');
    }
  }
}

export class OAuth2Code extends AggregateRoot<OAuth2CodeProps> {
  private readonly _created: Date;

  get id(): number {
    if (this._id === undefined) {
      throw new InvalidGrant('Code is not saved');
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

  get code(): string {
    return this.props.code;
  }

  get codeChallenge(): string | undefined {
    return this.props.codeChallenge;
  }

  get codeChallengeMethod(): OAuth2CodeChallengeMethod | undefined {
    return this.props.codeChallengeMethod;
  }

  get created(): Date {
    return this._created;
  }

  private constructor(props: OAuth2CodeProps, id?: number) {
    super(props, id);
    this._created = props.created ? props.created : new Date();
  }

  async createToken(client: OAuth2Client, codeVerifier: string | undefined): Promise<OAuth2Token> {
    const expiryConfig = config.get('oauth2.expiry');

    if (this.props.client !== client) {
      throw new UnauthorizedClient('The client associated with the token did not match with the authenticated client credentials');
    }

    if (this._created.getTime() + expiryConfig.code < Math.floor(Date.now() / 1000)) {
      throw new InvalidRequest('The supplied code has expired.');
    }

    this.addDomainEvent(new CodeUsedEvent(this, codeVerifier))

    validatePKCE(codeVerifier, this.props.codeChallenge, this.props.codeChallengeMethod);

    return OAuth2Token.createForUser(client, this.props.user);
  }

  static async create(props: OAuth2CodeProps, id?: number): Promise<OAuth2Code> {

    const guardedProps = [
      { argument: props.user, argumentName: 'user' },
      { argument: props.client, argumentName: 'client' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!guardResult.succeeded) {
      throw new InvalidRequest(guardResult.message);
    } else {
      const code = new OAuth2Code({
        ...props,
      }, id);

      const idWasProvided = !!id;
      if (!idWasProvided) {
        code.addDomainEvent(new CodeCreatedEvent(code));
      }

      return code;
    }
  }

  static async createForUser(client: OAuth2Client, user: User, codeChallenge?: string, codeChallengeMethod?: OAuth2CodeChallengeMethod): Promise<OAuth2Code> {
    const code = crypto.randomBytes(32).toString('base64').replace('=', '');

    return OAuth2Code.create({
      client: client,
      user: user,
      code: code,
      codeChallenge: codeChallenge,
      codeChallengeMethod: codeChallengeMethod,
    })
  }

  static fromCode(code: OAuth2Code, id?: number): OAuth2Code {
    return new OAuth2Code({
      ...code.props
    }, id);
  }
}
