import {User} from "@modules/user/domain/User";
import {OAuth2Client} from "./OAuth2Client";

export type OAuth2Token = {
  readonly id?: number,
  readonly client: OAuth2Client,
  readonly user: User,

  readonly tokenType: 'bearer',
  readonly accessToken: string,
  readonly refreshToken: string,
  readonly accessTokenExpires: number,
  readonly refreshTokenExpires: number,

  readonly created?: Date,
  readonly updated?: Date,
};
