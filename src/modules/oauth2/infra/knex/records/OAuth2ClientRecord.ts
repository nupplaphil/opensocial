import {Timestamps} from "@db/records/Timestamps";

export type OAuth2ClientRecord = {
  id: number,
  client_id: string,
  user_id: number,

  name: string | '',
  client_secret: string,
  allow_grant_types: string,
} & Timestamps;
