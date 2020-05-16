import {Timestamps} from "@db/records/Timestamps";

export type UserRecord = {
  id: number,
  name: string,
  username: string,
  email: string,
  guid: string,
  type: number,
  active: number,
} & Timestamps;
