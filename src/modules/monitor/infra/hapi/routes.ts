import { ServerRoute } from '@hapi/hapi';
import * as handler from "./handler";
import { monitorResponse } from './joi/Monitor';

export const liveness: ServerRoute = {
  method: 'GET',
  path: '/monitor/liveness',
  handler: handler.liveness,
  options: {
    description: 'Tests the application\'s "liveness"',
    tags: ['api'],
    response: {
      schema: monitorResponse,
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
      schema: monitorResponse,
    },
  },
};
