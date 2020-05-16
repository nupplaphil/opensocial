export type OAuth2CodeRecord = {
  id: number,
  client_id: string,
  user_id: number,

  code: string,
  code_challenge: string,
  code_challenge_method: string

  created_at: Date,
};
