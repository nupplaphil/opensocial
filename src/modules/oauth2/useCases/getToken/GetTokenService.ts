import {OAuth2Client} from "@modules/oauth2/domain";
import {TokenServiceInterface} from "@modules/oauth2/commons/TokenService";
import {InvalidRequest} from "@modules/oauth2/domain/error";
import {UserRepositoryInterface} from "@modules/user/repositories";

export type AuthorizationCodeDTO = {
  code: string,
  redirect_uri: string,
  code_verifier?: string,
};

export type PasswordDTO = {
  username: string,
  password: string,
}

export type RefreshTokenDTO = {
  refresh_token: string,
};

export type ResponseDTO = {
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token?: string,
};

export interface GetTokenServiceInterface {
  withClientCredentials: (client: OAuth2Client) => Promise<ResponseDTO>;
  withAuthorizationCode: (client: OAuth2Client, payload: AuthorizationCodeDTO) => Promise<ResponseDTO>;
  withPassword: (client: OAuth2Client, payload: PasswordDTO) => Promise<ResponseDTO>;
  withRefreshToken: (client: OAuth2Client, payload: RefreshTokenDTO) => Promise<ResponseDTO>;
}

export const withAuthorizationCode = (tokenService: TokenServiceInterface) => async (client: OAuth2Client, payload: AuthorizationCodeDTO): Promise<ResponseDTO> => {
  if (!payload.code) {
    throw new InvalidRequest('The "code" property is required');
  }

  if (!payload.redirect_uri) {
    throw new InvalidRequest('The "redirect_uri" property is required');
  }

  //if (!await tokenService.validateRedirectUri(client, payload.redirect_uri)) {
//    throw new InvalidRequest('This value for "redirect_uri" is not recognized.');
//  }

  const token = await tokenService.generateFromCode(client, payload.code, payload.code_verifier);

  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
  }
};

export const withClientCredentials = (tokenService: TokenServiceInterface) => async (client: OAuth2Client): Promise<ResponseDTO> => {
  const token = await tokenService.generateForClient(client);

  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
  };
};

export const withPassword = (tokenService: TokenServiceInterface, userRepo: UserRepositoryInterface) => async (client: OAuth2Client, payload: PasswordDTO): Promise<ResponseDTO> => {
  const user = await userRepo.getValidUser(payload.username, payload.password);

  const token = await tokenService.generateForUser(client, user);

  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
  }
};

export const withRefreshToken = (tokenService: TokenServiceInterface) => async (client: OAuth2Client, payload: RefreshTokenDTO): Promise<ResponseDTO> => {
  if (!payload.refresh_token) {
    throw new InvalidRequest('The "refres_token" property is required');
  }

  const token = await tokenService.generateFromRefreshToken(client, payload.refresh_token);

  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
  };
};

export default async function (tokenService: Promise<TokenServiceInterface>, userRepo: Promise<UserRepositoryInterface>): Promise<GetTokenServiceInterface> {

  return {
    withAuthorizationCode: withAuthorizationCode(await tokenService),
    withClientCredentials: withClientCredentials(await tokenService),
    withPassword: withPassword(await tokenService, await userRepo),
    withRefreshToken: withRefreshToken(await tokenService),
  };
}
