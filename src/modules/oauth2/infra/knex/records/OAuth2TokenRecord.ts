import {Timestamps} from "@db/records/Timestamps";

export type OAuth2TokenRecord = {
  id: number,
  client_id: number,
  user_id: number,

  access_token: string,
  refresh_token: string,
  access_token_expires: number,
  refresh_token_expires: number,
} & Timestamps;
