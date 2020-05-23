import {Timestamps} from "@db/records/Timestamps";

export type UserRecord = {
  id: number,
  name: string,
  username: string,
  usernameLower: string,
  password?: string,
  email: string,
  uuid: string,
  type: number,
  active: number,
} & Timestamps;
