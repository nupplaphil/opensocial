import {OAuth2Client} from "@modules/oauth2/domain/OAuth2Client";

export type OAuth2RedirectUri = {
  readonly id?: number,
  readonly client: OAuth2Client,

  readonly uri: string,
};
