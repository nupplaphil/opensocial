type Opaque<K, T> = T & { __TYPE__ : K };

export type Email = Opaque<"EMail", string>;

export type User = {
  id: number;
  email: Email;
  guid: string;
  name: string;
  password: string;
  username: string;
}
