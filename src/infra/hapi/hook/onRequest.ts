import {ServerExtEventsRequestObject} from '@hapi/hapi';
import {createLogger} from '@util';

const LOGGER = createLogger('OnRequest');

export const onRequest: ServerExtEventsRequestObject = {
  type: 'onRequest',
  method: (request, h) => {
    if (request.path !== '/monitor/liveness' && request.path !== '/monitor/readiness' && !request.path.includes('swagger')) {
      LOGGER.notice(`Begin: ${request.method.toUpperCase()} ${request.path}`);
    } else {
      LOGGER.info(`Begin: ${request.method.toUpperCase()} ${request.path}`);
    }
//    LOGGER.debug('Full Request Object', { request: request });
    LOGGER.info('Request Metadata', { info: request.info });
    if (request.headers && Object.keys(request.headers).length !== 0) {
      LOGGER.info('Request Headers', { headers: request.headers });
    }
    if (request.payload && Object.keys(request.payload).length !== 0) {
      LOGGER.info('Request Payload', { payload: request.payload });
    }
    if (request.query && Object.keys(request.query).length !== 0) {
      LOGGER.info('Request Query Parameters', { query: request.query });
    }
    if (request.params && Object.keys(request.params).length !== 0) {
      LOGGER.info('Request Path Parameters', { params: request.params });
    }
    return h.continue;
  },
};
