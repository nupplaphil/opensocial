import {BaseContext, invokeMiddlewares, MemoryRequest, MemoryResponse} from "@curveball/core";
import chai from "chai";
import chaiXml from "chai-xml";
import {User, UserPassword} from "@modules/user/domain";
import {UserRepositoryInterface} from "@modules/user/repositories";
import WebfingerController from "./WebfingerController";
import WebfingerService from "./WebfingerService";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import config from "../../../../config/environment";
import {jrd, serverUrl, xrd} from "../../commons/ControllerUtilities";

const expect = chai.expect;
chai.use(chaiXml);

const userRepoMock = async(expectedUser: User, expectedId?: number, expectedUuid?: string, expectedUsername?: string): Promise<UserRepositoryInterface> => {
  return {
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-empty-function
    async delete(entity: User): Promise<void> {},
    async getActiveById(id: number): Promise<User> {
      if (expectedId) {
        expect(id).to.be.eq(expectedId);
      }
      return expectedUser;
    },
    async getById(id: number): Promise<User> {
      if (expectedId) {
        expect(id).to.be.eq(expectedId);
      }
      return expectedUser;
    },
    async getByUUID(uuid: string): Promise<User> {
      if (expectedUuid) {
        expect(uuid).to.be.eq(expectedUuid);
      }
      return expectedUser;
    },
    async getByUsername(username: string): Promise<User> {
      if (expectedUsername) {
        expect(username).to.be.eq(expectedUsername);
      }
      return expectedUser;
    },
    async save(entity: User): Promise<User> {
      return entity;
    }
  }
}

describe('WebfingerController', async() => {
  describe('GET', async () => {
    let user: User;

    before(async() => {
      user = await User.create({
        uuid: new UniqueEntityID('12345'),
        active: true,
        email: "test@email.info",
        name: "Test User",
        password: await UserPassword.create('testtest12345'),
        type: 'user',
        username: 'Username',
      }, 1);
    });

    describe('using JSON', async () => {
      it('returns an user for a valid account search', async () => {
        const request = new MemoryRequest('GET', '?resource=acct:Username', {'Accept': jrd});
        const context = new BaseContext(request, new MemoryResponse());

        const webfingerService = WebfingerService(userRepoMock(user, 1, '12345', user.username.toLowerCase()));
        const webfingerController = WebfingerController(webfingerService);

        await invokeMiddlewares(context, [webfingerController]);

        expect(context.response.body).to.has.property('subject', `acct:${user.username}@${config.get('server').host}`);
        expect(context.response.body).to.has.property('links');
      });

      it('returns an user for a valid user search', async () => {
        const request = new MemoryRequest('GET', `?resource=${serverUrl}/users/${user.id}`, {'Accept': jrd});
        const context = new BaseContext(request, new MemoryResponse());

        const webfingerService = WebfingerService(userRepoMock(user, 1, '12345', user.username.toLowerCase()));
        const webfingerController = WebfingerController(webfingerService);

        await invokeMiddlewares(context, [webfingerController]);

        expect(context.response.body).to.has.property('subject', `acct:${user.username}@${config.get('server').host}`);
        expect(context.response.body).to.has.property('links');
      });

      it('returns an user for a valid profile search', async () => {
        const request = new MemoryRequest('GET', `?resource=${serverUrl.toLowerCase()}/@${user.username}`, {'Accept': jrd});
        const context = new BaseContext(request, new MemoryResponse());

        const webfingerService = WebfingerService(userRepoMock(user, 1, '12345', user.username.toLowerCase()));
        const webfingerController = WebfingerController(webfingerService);

        await invokeMiddlewares(context, [webfingerController]);

        expect(context.response.body).to.has.property('subject', `acct:${user.username}@${config.get('server').host}`);
        expect(context.response.body).to.has.property('links');
      });
    });

    describe('using XRD', async () => {
      let expectedXRD: string;

      before(async () => {
        expectedXRD = `<?xml version="1.0" encoding="UTF-8"?><XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0"><Subject>acct:${user.username}@${config.get('server').host}</Subject><Link rel="self" type="application/activity+json" href="${serverUrl}/users/${user.id}"/><Link rel="http://webfinger.net/rel/profile-page" type="text/html" href="${serverUrl}/@${user.username}"/><Link rel="http://ostatus.org/schema/1.0/subscribe" template="${serverUrl}/authorize-follow?acct={uri}"/></XRD>`
      });

      it('returns an user for a valid account search', async () => {
        const request = new MemoryRequest('GET', '?resource=acct:Username', {'Accept': xrd});
        const context = new BaseContext(request, new MemoryResponse());

        const webfingerService = WebfingerService(userRepoMock(user, 1, '12345', user.username.toLowerCase()));
        const webfingerController = WebfingerController(webfingerService);

        await invokeMiddlewares(context, [webfingerController]);

        expect(context.response.body).xml.to.be.valid();
        expect(context.response.body).xml.to.be.eq(expectedXRD);
      });

      it('returns an user for a valid user search', async () => {
        const request = new MemoryRequest('GET', `?resource=${serverUrl}/users/${user.id}`, {'Accept': xrd});
        const context = new BaseContext(request, new MemoryResponse());

        const webfingerService = WebfingerService(userRepoMock(user, 1, '12345', user.username.toLowerCase()));
        const webfingerController = WebfingerController(webfingerService);

        await invokeMiddlewares(context, [webfingerController]);

        expect(context.response.body).xml.to.be.valid();
        expect(context.response.body).xml.to.be.eq(expectedXRD);
      });

      it('returns an user for a valid profile search', async () => {
        const request = new MemoryRequest('GET', `?resource=${serverUrl.toLowerCase()}/@${user.username}`, {'Accept': xrd});
        const context = new BaseContext(request, new MemoryResponse());

        const webfingerService = WebfingerService(userRepoMock(user, 1, '12345', user.username.toLowerCase()));
        const webfingerController = WebfingerController(webfingerService);

        await invokeMiddlewares(context, [webfingerController]);

        expect(context.response.body).xml.to.be.valid();
        expect(context.response.body).xml.to.be.eq(expectedXRD);
      });
    });
  });
});
