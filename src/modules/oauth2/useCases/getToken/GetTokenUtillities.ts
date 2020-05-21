import {Context} from "@curveball/core";
import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories";
import {OAuth2Client} from "@modules/oauth2/domain";
import {InvalidRequest, NotFound, UnauthorizedClient} from "@modules/oauth2/domain/error";

export const parseBasic = (ctx: Context): null | [string, string] => {

  const authHeader = ctx.request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ', 2);
  if (parts.length < 2 || parts[0].toLowerCase() !== 'basic') {
    return null;
  }

  const decoded = Buffer.from(parts[1], 'base64').toString('utf-8').split(':', 2);
  if (decoded.length < 2) {
    return null;
  }

  return decoded as [string, string];
}

export const getOAuth2ClientFromBasicAuth = (clientRepo: OAuth2ClientRepositoryInterface) => async(ctx: Context): Promise<OAuth2Client> => {
  const basicAuth = parseBasic(ctx);

  if (!basicAuth) {
    throw new InvalidRequest('Authorization header is empty');
  } else {
    try {
      const client = await clientRepo.getByClient(basicAuth[0]);

      if (!await client.validateSecret(basicAuth[1])) {
        throw new UnauthorizedClient('Client id or secret incorrect');
      }

      return client;
    } catch (e) {
      if (e instanceof NotFound) {
        throw new UnauthorizedClient('Client id or secret incorrect');
      } else {
        throw e;
      }
    }
  }
}

export const getOauth2ClientFromBody = (clientRepo: OAuth2ClientRepositoryInterface) => async(ctx: Context): Promise<OAuth2Client> => {
  if (!ctx.request.body?.hasOwnProperty('client_id')) {
    throw new InvalidRequest('The "client_id" property is required');
  }

  try {
    return await clientRepo.getByClient(ctx.request.body.client_id);
  } catch (e) {
    if (e instanceof NotFound) {
      throw new UnauthorizedClient('Client id unknown');
    } else {
      throw e;
    }
  }
}
