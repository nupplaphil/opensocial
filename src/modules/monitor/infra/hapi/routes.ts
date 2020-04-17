import { ServerRoute } from '@hapi/hapi';
import * as handler from "./handler";
import * as joiModel from './model';

export const liveness: ServerRoute = {
  method: 'GET',
  path: '/monitor/liveness',
  handler: handler.liveness,
  options: {
    description: 'Tests the application\'s "liveness"',
    tags: ['api'],
    response: {
      schema: joiModel.monitorResponse,
    },
  },
};

export const readiness: ServerRoute = {
  method: 'GET',
  path: '/monitor/readiness',
  handler: handler.readiness,
  options: {
    description: 'Tests the application\'s "readiness"',
    tags: ['api'],
    response: {
      schema: joiModel.monitorResponse,
    },
  },
};
