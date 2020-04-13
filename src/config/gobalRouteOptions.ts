import { RouteOptions } from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { logger } from '@util/Logger';
import config from '@config/environment';

const globalRouteOptions: RouteOptions = {
  validate: {
    failAction: async function (request, h, err): Promise<void> {
      logger.alert('RequestValidationError', { error: err });
      if (await config.get('env') === 'production') {
        // In prod, throw the default Bad Request
        throw Boom.badRequest('Invalid request payload');
      } else {
        // During development, respond with the full error
        throw err;
      }
    },
  },
  response: {
    failAction: async function (request, h, err): Promise<void> {
      logger.alert('ResponseValidationError', { error: err });
      if (await config.get('env') === 'production') {
        // In prod, throw the default Internal Server Error
        throw Boom.boomify(new Error('Invalid response payload'));
      } else {
        // During development, respond with the full error
        throw err;
      }
    },
  },
};


export default globalRouteOptions;
