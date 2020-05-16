import {Context} from "@curveball/core";
import {Controller} from "@curveball/controller";

import {OAuth2Client, OAuth2GrantType} from "@modules/oauth2/domain";
import {OAuth2ClientRepositoryInterface} from "@modules/oauth2/repositories";
import {TokenServiceInterface} from "@modules/oauth2/commons";
import {UnsupportedGrantType} from "@modules/oauth2/domain/error";
import {
  getOAuth2ClientFromBasicAuth,
  getOauth2ClientFromBody
} from "./GetTokenUtillities";
import {GetTokenServiceInterface} from "./GetTokenService";

export class GetTokenController extends Controller {
  private static sendCORSHeaders (ctx: Context): void {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  }

  constructor(
    private getTokenService: Promise<GetTokenServiceInterface>,
    private tokenService: Promise<TokenServiceInterface>,
    private clientRepository: Promise<OAuth2ClientRepositoryInterface>,
  ) {
    super();
  }

  async post(ctx: Context): Promise<void> {
    GetTokenController.sendCORSHeaders(ctx);

    const grantType = ctx.request.body.grant_type as OAuth2GrantType;

    if (!OAuth2GrantType.includes(grantType)) {
      throw new UnsupportedGrantType('The "grant_type" must be one of ' + OAuth2GrantType.join(', '));
    }

    let oAuth2Client: OAuth2Client;

    switch (grantType) {
      case "authorization_code":
        oAuth2Client = await getOauth2ClientFromBody(await this.clientRepository)(ctx);
        break;
      case "refresh_token":
        if (ctx.request.headers.has('Authorization')) {
          oAuth2Client = await getOAuth2ClientFromBasicAuth(await this.tokenService, await this.clientRepository)(ctx);
        } else {
          oAuth2Client = await getOauth2ClientFromBody(await this.clientRepository)(ctx);
        }
        break;
      default:
        oAuth2Client = await getOAuth2ClientFromBasicAuth(await this.tokenService, await this.clientRepository)(ctx);
        break;
    }

    if (!oAuth2Client.allowGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    switch (grantType) {
      case "authorization_code":
        ctx.response.type = 'application/json';
        ctx.response.body = await (await this.getTokenService).withAuthorizationCode(oAuth2Client, ctx.request.body);
        break;
      case "client_credentials":
        ctx.response.type = 'application/json';
        ctx.response.body = await (await this.getTokenService).withClientCredentials(oAuth2Client);
        break;
      case "password":
        ctx.response.body = await (await this.getTokenService).withPassword(oAuth2Client, ctx.request.body);
        break;
      case "refresh_token":
        ctx.response.body = await (await this.getTokenService).withRefreshToken(oAuth2Client, ctx.request.body);
    }
  }

  async options(ctx: Context): Promise<void> {
    GetTokenController.sendCORSHeaders(ctx);
  }
}
