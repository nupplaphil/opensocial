import {RouteOptions} from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import {createLogger} from '@util';
import config from '@config/environment';

const LOGGER = createLogger('HAPI globalRouteOptions');

export const globalRouteOptions: RouteOptions = {
  validate: {
    failAction: async function (request, h, err): Promise<void> {
      LOGGER.alert('RequestValidationError', { error: err });
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
      LOGGER.alert('ResponseValidationError', { error: err });
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
