import {Context, Middleware} from "@curveball/core";
import {NotImplemented} from "@curveball/http-errors";

import {OAuth2Client, OAuth2GrantType} from "@modules/oauth2/domain";
import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories";
import {UnsupportedGrantType} from "@modules/oauth2/domain/error";
import {getOAuth2ClientFromBasicAuth, getOauth2ClientFromBody} from "./GetTokenUtillities";
import {GetTokenServiceInterface} from "./GetTokenService";

const sendCORSHeaders = (ctx: Context): void  => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
}

export const options = async (ctx: Context): Promise<void> => {
  sendCORSHeaders(ctx);
}

export const post = (getTokenService: GetTokenServiceInterface,
              clientRepository: OAuth2ClientRepositoryInterface) => async (ctx: Context): Promise<void> => {
  sendCORSHeaders(ctx);

  if (!ctx.request.body?.hasOwnProperty('grant_type')) {
    throw new UnsupportedGrantType('The "grant_type" property is required');
  }

  const grantType = ctx.request.body.grant_type as OAuth2GrantType;

  if (!OAuth2GrantType.includes(grantType)) {
    throw new UnsupportedGrantType('The "grant_type" must be one of ' + OAuth2GrantType.join(', '));
  }

  let oAuth2Client: OAuth2Client;

  switch (grantType) {
    case "authorization_code":
      oAuth2Client = await getOauth2ClientFromBody(clientRepository)(ctx);
      break;
    case "refresh_token":
      if (ctx.request.headers.has('Authorization')) {
        oAuth2Client = await getOAuth2ClientFromBasicAuth(clientRepository)(ctx);
      } else {
        oAuth2Client = await getOauth2ClientFromBody(clientRepository)(ctx);
      }
      break;
    default:
      oAuth2Client = await getOAuth2ClientFromBasicAuth(clientRepository)(ctx);
      break;
  }

  if (!oAuth2Client.allowGrantTypes.includes(grantType)) {
    throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
  }

  switch (grantType) {
    case "authorization_code":
      ctx.response.type = 'application/json';
      ctx.response.body = await getTokenService.withAuthorizationCode(oAuth2Client, ctx.request.body);
      break;
    case "client_credentials":
      ctx.response.type = 'application/json';
      ctx.response.body = await getTokenService.withClientCredentials(oAuth2Client);
      break;
    case "password":
      ctx.response.body = await getTokenService.withPassword(oAuth2Client, ctx.request.body);
      break;
    case "refresh_token":
      ctx.response.body = await getTokenService.withRefreshToken(oAuth2Client, ctx.request.body);
  }
}

export default function(
  getTokenService: Promise<GetTokenServiceInterface>,
  clientRepository: Promise<OAuth2ClientRepositoryInterface>,
): Middleware {

  return async (ctx: Context): Promise<void> => {
    const method = ctx.request.method.toLowerCase();

    switch (method) {
      case "post":
        return post(
          await getTokenService,
          await clientRepository)(ctx);
      case "options":
        return options(ctx);
      default:
        throw new NotImplemented(method + ' is not implemented');
    }
  }
}
