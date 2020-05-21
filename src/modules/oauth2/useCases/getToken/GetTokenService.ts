import {UserRepositoryInterface} from "@modules/user/repositories";

import {OAuth2Client, OAuth2Token} from "@modules/oauth2/domain";
import {InvalidGrant, InvalidRequest, NotFound} from "@modules/oauth2/domain/error";
import {OAuth2CodesRepositoryInterface, OAuth2TokenRepositoryInterface} from "@modules/oauth2/repositories";

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

export const withAuthorizationCode = (tokenRepo: OAuth2TokenRepositoryInterface, codesRepo: OAuth2CodesRepositoryInterface) => async (client: OAuth2Client, payload: AuthorizationCodeDTO): Promise<ResponseDTO> => {
  if (!payload.code) {
    throw new InvalidRequest('The "code" property is required');
  }

  if (!payload.redirect_uri) {
    throw new InvalidRequest('The "redirect_uri" property is required');
  }

  //if (!await tokenService.validateRedirectUri(client, payload.redirect_uri)) {
//    throw new InvalidRequest('This value for "redirect_uri" is not recognized.');
//  }

  try {
    const codeRecord = await codesRepo.getByCode(payload.code);
    const token = await codeRecord.createToken(client, payload.code_verifier);

    await tokenRepo.save(token);

    return {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: token.refreshToken,
    }
  } catch (err) {
    if (err instanceof NotFound) {
      throw new InvalidRequest('The supplied code was not recognized');
    } else {
      throw err;
    }
  }
};

export const withClientCredentials = (tokenRepo: OAuth2TokenRepositoryInterface) => async (client: OAuth2Client): Promise<ResponseDTO> => {
  const token = await OAuth2Token.createForClient(client);

  await tokenRepo.save(token);

  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
  };
};

export const withPassword = (tokenRepo: OAuth2TokenRepositoryInterface, userRepo: UserRepositoryInterface) => async (client: OAuth2Client, payload: PasswordDTO): Promise<ResponseDTO> => {
  const user = await userRepo.getByUsername(payload.username);

  if (!user.password || !await user.password.compare(payload.password)) {
    throw new InvalidGrant('Unknown username or password');
  }

  if (!user.active) {
    throw new InvalidGrant('User is inactive');
  }

  const token = await OAuth2Token.createForUser(client, user);

  await tokenRepo.save(token);

  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
  }
};

export const withRefreshToken = (tokenRepo: OAuth2TokenRepositoryInterface) => async (client: OAuth2Client, payload: RefreshTokenDTO): Promise<ResponseDTO> => {
  if (!payload.refresh_token) {
    throw new InvalidRequest('The "refresh_token" property is required');
  }

  try {
    const oldToken = await tokenRepo.getByRefreshToken(payload.refresh_token);
    const newToken = await oldToken.createNewToken(client);

    await tokenRepo.save(newToken);

    return {
      access_token: newToken.accessToken,
      token_type: newToken.tokenType,
      expires_in: newToken.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: newToken.refreshToken,
    };
  } catch (err) {
    if (err instanceof NotFound) {
      throw new InvalidGrant('The refresh token was not recognized');
    } else {
      throw err;
    }
  }
};

export default async function (tokenRepo: Promise<OAuth2TokenRepositoryInterface>, codeRepo: Promise<OAuth2CodesRepositoryInterface>, userRepo: Promise<UserRepositoryInterface>): Promise<GetTokenServiceInterface> {

  return {
    withAuthorizationCode: withAuthorizationCode(await tokenRepo, await codeRepo),
    withClientCredentials: withClientCredentials(await tokenRepo),
    withPassword: withPassword(await tokenRepo, await userRepo),
    withRefreshToken: withRefreshToken(await tokenRepo),
  };
}
