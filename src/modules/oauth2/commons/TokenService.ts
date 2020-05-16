import crypto from "crypto";
import bcrypt from "bcrypt";

import {User} from "@modules/user/domain";
import {OAuth2Client, OAuth2CodeChallengeMethod, OAuth2Token} from "@modules/oauth2/domain";
import {
  InvalidRequest,
  UnauthorizedClient,
  InvalidGrant,
  NotFound,
} from "@modules/oauth2/domain/error";
import {OAuth2TokenRepositoryInterface, OAuth2CodesRepositoryInterface} from "@modules/oauth2/repositories";

export interface TokenServiceInterface {
  validateSecret: (client: OAuth2Client, secret: string) => Promise<boolean>,
  generateFromCode: (client: OAuth2Client, code: string, codeVerifier: string | undefined) => Promise<OAuth2Token>;
  generateForClient: (client: OAuth2Client) => Promise<OAuth2Token>;
  generateForUser: (client: OAuth2Client, user: User) => Promise<OAuth2Token>;
  generateFromRefreshToken: (client: OAuth2Client, refreshToken: string) => Promise<OAuth2Token>;
}

import config from "@config/environment";

export type TokenExpiry = {
  accessToken: number,
  refreshToken: number,
  code: number,
};

export const getTokenExpiry = (): TokenExpiry => {
  const expiryConfig = config.get('oauth2.expiry');

  return {
    accessToken: expiryConfig.accessToken,
    refreshToken: expiryConfig.refreshToken,
    code: expiryConfig.code,
  };
};


export const validatePKCE = (codeVerifier: string | undefined, codeChallenge: string | undefined, codeChallengeMethod: OAuth2CodeChallengeMethod): void => {
  if (!codeChallenge && !codeVerifier) {
    // This request was not initiated with PKCE support, so ignore the validation
    return;
  } else if (codeChallenge && !codeVerifier) {
    // The authorization request started with PKCE, but the token request did not follow through
    throw new InvalidRequest('The code verifier was not supplied');
  } else if (codeChallenge && codeVerifier) {
    // For the plain method, the derived code and the code verifier are the same
    let derivedCodeChallenge = codeVerifier;

    if (codeChallengeMethod === 'S256') {
      derivedCodeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }

    if (codeChallenge !== derivedCodeChallenge) {
      throw new InvalidGrant('The code verifier does not match the code challenge');
    }
  }
}

export const generateTokenForUser = (tokenRepo: OAuth2TokenRepositoryInterface) => async (client: OAuth2Client, user: User): Promise<OAuth2Token> => {
  if (!user.active || !client.id) {
    throw new Error('Cannot generate token for inactive user.');
  }

  const accessToken = crypto.randomBytes(32).toString('base64').replace('=', '');
  const refreshToken = crypto.randomBytes(32).toString('base64').replace('=', '');

  const expirySettings = getTokenExpiry();

  const accessTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.accessToken;
  const refreshTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.refreshToken;

  return await tokenRepo.create({
    tokenType: "bearer",
    client: client,
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: user,
    accessTokenExpires: accessTokenExpires,
    refreshTokenExpires: refreshTokenExpires
  });
};

export const generateTokenForClient = (tokenRepo: OAuth2TokenRepositoryInterface) => async (client: OAuth2Client): Promise<OAuth2Token> => {
  return generateTokenForUser(tokenRepo)(client, client.user);
};

export const generateTokenFromCode = (tokenRepo: OAuth2TokenRepositoryInterface, codesRepo: OAuth2CodesRepositoryInterface) => async (client: OAuth2Client, code: string, codeVerifier: string | undefined): Promise<OAuth2Token> => {
  let codeRecord;

  try {
    codeRecord = await codesRepo.getByCode(code);
  } catch (err) {
    if (err instanceof NotFound) {
      throw new InvalidRequest('The supplied code was not recognized');
    } else {
      throw err;
    }
  }

  const expirySettings = getTokenExpiry();

  await codesRepo.delete(codeRecord);

  validatePKCE(codeVerifier, codeRecord.codeChallenge, codeRecord.codeChallengeMethod);

  if ((codeRecord.created ? codeRecord.created.getMilliseconds() : 0) + expirySettings.code < Math.floor(Date.now() / 1000)) {
    throw new InvalidRequest('The supplied code has expired.');
  }

  if (codeRecord.client !== client) {
    throw new UnauthorizedClient('The client associated with the token did not match with the authenticated client credentials');
  }

  return generateTokenForUser(tokenRepo)(client, codeRecord.user);
}

export const generateTokenFromRefreshToken = (tokenRepo: OAuth2TokenRepositoryInterface) => async (client: OAuth2Client, refreshToken: string): Promise<OAuth2Token> => {
  let oldToken;

  try {
    oldToken = await tokenRepo.getByRefreshToken(refreshToken);
  } catch (err) {
    if (err instanceof NotFound) {
      throw new InvalidGrant('The refresh token was not recognized');
    } else {
      throw err;
    }
  }

  if (oldToken.client.clientId !== client.clientId) {
    throw new UnauthorizedClient('The client_id associated with the refresh did not match with the authenticated client credentials');
  }

  await tokenRepo.delete(oldToken);
  return generateTokenForUser(tokenRepo)(client, oldToken.user);
}

export const validateSecret = async(client: OAuth2Client, secret: string): Promise<boolean> => {
  return await bcrypt.compare(secret, client.clientSecret.toString('utf-8'));
}

export default async function (tokenRepo: Promise<OAuth2TokenRepositoryInterface>, codeRepo: Promise<OAuth2CodesRepositoryInterface>): Promise<TokenServiceInterface> {

  return {
    validateSecret: validateSecret,
    generateForClient: generateTokenForClient(await tokenRepo),
    generateForUser: generateTokenForUser(await tokenRepo),
    generateFromCode: generateTokenFromCode(await tokenRepo, await codeRepo),
    generateFromRefreshToken: generateTokenFromRefreshToken(await tokenRepo)
  };
}
