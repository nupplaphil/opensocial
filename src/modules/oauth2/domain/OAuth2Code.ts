import {OAuth2Client} from "@modules/oauth2/domain/OAuth2Client";
import {User} from "@modules/user/domain";
import {OAuth2CodeChallengeMethod} from "./OAuth2CodeChallengeMethod";

export type OAuth2Code = {
  readonly id?: number,
  readonly client: OAuth2Client,
  readonly user: User,

  readonly code: string,
  readonly codeChallenge: string,
  readonly codeChallengeMethod: OAuth2CodeChallengeMethod

  readonly created?: Date,
};
