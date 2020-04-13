import { ServerRoute } from '@hapi/hapi';
import * as wellknown from '@route/handler/WellKnownHandler';
import * as joiModels from '@route/model/joi';

const webfinger: ServerRoute = {
  method: 'GET',
  path: '/.well-known/webfinger',
  handler: wellknown.webfinger,
  options: {
    description: 'Retrieves data from the webfinger endpoint',
    tags: ['api'],
    response: {
      schema: joiModels.accountResponse,
    },
  },
};

export default webfinger;
