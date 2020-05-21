import {BaseContext, invokeMiddlewares, MemoryRequest, MemoryResponse} from "@curveball/core";
import chai from "chai";
import GetTokenController from "@modules/oauth2/useCases/getToken/GetTokenController";
import GetTokenService, {GetTokenServiceInterface} from "@modules/oauth2/useCases/getToken/GetTokenService";
import {
  OAuth2ClientRepositoryInterface,
  OAuth2CodesRepositoryInterface,
  OAuth2TokenRepositoryInterface,
} from "@modules/oauth2/repositories";
import {OAuth2GrantType} from "@modules/oauth2/domain/OAuth2GrantType";
import {User} from "@modules/user/domain";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {OAuth2Client, OAuth2Code, OAuth2Token} from "@modules/oauth2/domain";
import {UserPassword} from "@modules/user/domain/UserPassword";
import {UserRepositoryInterface} from "@modules/user/repositories";

const expect = chai.expect;

const clientRepoMock = async(expectedOAuth2Client: OAuth2Client, expectedId?: number, expectedClientId?: string): Promise<OAuth2ClientRepositoryInterface> => {
  return {
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-empty-function
    async delete(entity: OAuth2Client): Promise<void> {},
    async getByClient(clientId: string): Promise<OAuth2Client> {
      if (expectedClientId) {
        expect(clientId).to.be.eq(expectedClientId);
      }
      return expectedOAuth2Client;
    },
    async getById(id: number): Promise<OAuth2Client> {
      if (expectedId) {
        expect(id).to.be.eq(expectedId);
      }
      return expectedOAuth2Client;
    },
    async save(entity: OAuth2Client): Promise<OAuth2Client> {return entity;}
  }
}

const codeRepoMock = async(expectedOAuth2Code: OAuth2Code, expectedId?: number, expectedCode?: string): Promise<OAuth2CodesRepositoryInterface> => {
  return {
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-empty-function
    async delete(entity: OAuth2Code): Promise<void> {},
    async getByCode(code: string): Promise<OAuth2Code> {
      if (expectedCode) {
        expect(code).to.be.eq(expectedCode);
      }
      return expectedOAuth2Code;
    },
    // eslint-disable-next-line no-unused-vars
    async getById(id: number): Promise<OAuth2Code> {
      if (expectedId) {
        expect(id).to.be.eq(expectedId);
      }
      return expectedOAuth2Code;
    },
    async save(entity: OAuth2Code): Promise<OAuth2Code> {return entity;}
  };
}

const tokenRepoMock = async(expectedOAuth2Token: OAuth2Token, expectedId?: number, expectedAccessToken?: string, expectedRefreshToken?: string): Promise<OAuth2TokenRepositoryInterface> => {
  return {
    async getByAccessToken(accessToken: string): Promise<OAuth2Token> {
      if (expectedAccessToken) {
        expect(accessToken).to.be.eq(expectedAccessToken);
      }
      return expectedOAuth2Token},
    async getById(id: number): Promise<OAuth2Token> {
      if (expectedId) {
        expect(id).to.be.eq(expectedId);
      }
      return expectedOAuth2Token;
    },
    async getByRefreshToken(refreshToken: string): Promise<OAuth2Token> {
      if (expectedRefreshToken) {
        expect(refreshToken).to.be.eq(expectedRefreshToken);
      }
      return expectedOAuth2Token;
    },
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-empty-function
    async delete(entity: OAuth2Token): Promise<void> {},
    async save(entity: OAuth2Token): Promise<OAuth2Token> {return entity;}
  }
}

describe('GetTokenController', async() => {
  describe('OPTIONS', async () => {

    it('returns a valid response', async () => {
      const request = new MemoryRequest('OPTIONS', '');
      const context = new BaseContext(request, new MemoryResponse());

      const tokenController = GetTokenController({} as Promise<GetTokenServiceInterface>, {} as Promise<OAuth2ClientRepositoryInterface>);

      await invokeMiddlewares(context, [tokenController]);

      expect(context.response.headers.has('Access-Control-Allow-Origin')).to.be.true;
      expect(context.response.headers.get('Access-Control-Allow-Origin')).to.be.eq('*');
    });
  });

  describe('POST', async () => {
    it('throws an error without a grant_type', async () => {
      const request = new MemoryRequest('POST', '');
      const context = new BaseContext(request, new MemoryResponse());

      const tokenController = GetTokenController({} as Promise<GetTokenServiceInterface>, {} as Promise<OAuth2ClientRepositoryInterface>);

      invokeMiddlewares(context, [tokenController]).catch((err: Error) => {
        expect(err.message).to.be.eq('The "grant_type" property is required');
        expect(err).to.include({httpStatus: 400, errorCode: 'unsupported_grant_type'});
      });
    });

    it('throws an error for an invalid grant_type', async () => {
      const request = new MemoryRequest('POST', '');
      request.body = {
        grant_type: 'invalid'
      };
      const context = new BaseContext(request, new MemoryResponse());

      const tokenController = GetTokenController({} as Promise<GetTokenServiceInterface>, {} as Promise<OAuth2ClientRepositoryInterface>);

      invokeMiddlewares(context, [tokenController]).catch((err: Error) => {
        expect(err.message).to.be.eq('The "grant_type" must be one of ' + OAuth2GrantType.join(', '));
        expect(err).to.include({httpStatus: 400, errorCode: 'unsupported_grant_type'});
      });
    });

    describe('using an authorization code', async () => {
      let user: User;
      let oAuth2Client: OAuth2Client;
      let oAuth2Code: OAuth2Code;
      let oAuth2Token: OAuth2Token;

      before(async() => {
        user = await User.create({
          uuid: new UniqueEntityID('12345'),
          active: true,
          email: "test@email.info",
          name: "Test User",
          password: await UserPassword.create('testtest12345'),
          type: 'user',
          username: 'username',
        }, 1);

      oAuth2Client = await OAuth2Client.create({
        allowGrantTypes: ['authorization_code'],
        clientId: 'client-id',
        clientSecret: Buffer.from('client-secret', 'utf-8'),
        name: 'name',
        user: user,
      }, 1);

      oAuth2Code = await OAuth2Code.create({
        client: oAuth2Client,
        code: "1234",
        created: new Date(2020,5,20,0,0,0),
        user: user,
      }, 1);

      oAuth2Token = await OAuth2Token.create({
        accessToken: "45467",
        accessTokenExpires: 0,
        refreshToken: "14567",
        refreshTokenExpires: 0,
        tokenType: "bearer",
        client: oAuth2Client,
        user: user,
        updated: new Date(2020,5,20,0,0,0),
        created: new Date(2020,5,20,0,0,0)
      }, 1);
      });

      it('returns a valid token for a valid user', async() => {
        const request = new MemoryRequest('POST', '');
        request.body = {
          grant_type: 'authorization_code',
          code: '1234',
          client_id: oAuth2Client.clientId,
          redirect_uri: 'test-red',
        };
        const context = new BaseContext(request, new MemoryResponse());

        const tokenService = GetTokenService(tokenRepoMock(oAuth2Token, oAuth2Token.id), codeRepoMock(oAuth2Code, oAuth2Code.id, '1234'), {} as Promise<UserRepositoryInterface>);
        const tokenController = GetTokenController(tokenService, clientRepoMock(oAuth2Client, oAuth2Client.id, oAuth2Client.clientId));

        await invokeMiddlewares(context, [tokenController]);

        expect(context.response.body).to.has.property('access_token').with.length(43);
        expect(context.response.body).to.has.property('refresh_token').with.length(43);
        expect(context.response.body).to.has.property('token_type', 'bearer');
        expect(context.response.body).to.has.property('expires_in').which.is.a('number');
      });

      it('throws an error without a client_id', async () => {
        const request = new MemoryRequest('POST', '');
        request.body = {
          grant_type: 'authorization_code',
        };
        const context = new BaseContext(request, new MemoryResponse());

        const tokenController = GetTokenController({} as Promise<GetTokenServiceInterface>, {} as Promise<OAuth2ClientRepositoryInterface>);

        invokeMiddlewares(context, [tokenController]).catch((err: Error) => {
          expect(err.message).to.be.eq(' The "client_id" property is required');
          expect(err).to.include({httpStatus: 400, errorCode: 'invalid_request'});
        });
      });

      it('throws an error without a client_id', async () => {
        const request = new MemoryRequest('POST', '');
        request.body = {
          grant_type: 'authorization_code',
        };
        const context = new BaseContext(request, new MemoryResponse());

        const tokenController = GetTokenController({} as Promise<GetTokenServiceInterface>, {} as Promise<OAuth2ClientRepositoryInterface>);

        invokeMiddlewares(context, [tokenController]).catch((err: Error) => {
          expect(err.message).to.be.eq(' The "client_id" property is required');
          expect(err).to.include({httpStatus: 400, errorCode: 'invalid_request'});
        });
      });
    });
  });
});
