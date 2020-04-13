import { Request, ResponseToolkit, ResponseObject, RequestQuery } from '@hapi/hapi';
import BaseHandler from '@route/handler/base/BaseHandler';
import * as models from '@route/model';
import * as boom from '@hapi/boom';
import {logger} from "@util/Logger";
import {Users} from "@repository";
import {Email, User} from "@model";

class WellKnownHandler extends BaseHandler {
  async webfinger(): Promise<ResponseObject> {
    const resource = (this.request.query as RequestQuery)['resource'] as string;
    if (resource == null || !resource.startsWith('acct:')) {
      throw boom.badRequest('Invalid resource');
    }

    const userQuery: Partial<User> = {
      email: 'me@isomr.co' as Email
    };

    const users = await Users.getUsers(userQuery);
    logger.alert(users.guid);

    const res: models.Account = {
      subject: 'acct:alice@my-example.com',
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: 'https://my-example.com/actor',
        },
      ],
    };
    return this.respondSuccess(this.h.response(res));
  }
}

export const webfinger = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => new WellKnownHandler(request, h).webfinger();
