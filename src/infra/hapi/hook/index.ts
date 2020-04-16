import { ServerExtEventsRequestObject } from '@hapi/hapi';
import { onRequest } from './onRequest';
import { onPreResponse } from './onPreResponse';

export const hooks: ServerExtEventsRequestObject[] = [
  onRequest,
  onPreResponse,
];
