import {ServerRoute} from '@hapi/hapi';
import * as handler from "./handler";
import * as joiModel from './model';

export const routes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/user/inbox/{id}',
    handler: handler.inbox,
    options: {
      description: 'Gets the user inbox',
      tags: ['api'],
      response: {
        schema: joiModel.InboxResponse,
      },
    }
  }
];
