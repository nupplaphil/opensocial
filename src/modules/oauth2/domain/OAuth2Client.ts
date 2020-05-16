import {User} from "@modules/user/domain/User";
import {OAuth2GrantType} from "./OAuth2GrantType";

export type OAuth2Client = {
  readonly id?: number,
  readonly clientId: string,
  readonly user: User,

  readonly name: string | ""
  readonly clientSecret: Buffer,
  readonly allowGrantTypes: OAuth2GrantType[],

  readonly created?: Date,
  readonly updated?: Date,
};
