import { ServerExtEventsRequestObject } from '@hapi/hapi';
import { logger } from '@util/Logger';

export const onRequest: ServerExtEventsRequestObject = {
  type: 'onRequest',
  method: (request, h) => {
    logger.setContext({ context: request.info.id });
    if (request.path !== '/monitor/liveness' && request.path !== '/monitor/readiness' && !request.path.includes('swagger')) {
      logger.notice(`Begin: ${request.method.toUpperCase()} ${request.path}`);
    } else {
      logger.info(`Begin: ${request.method.toUpperCase()} ${request.path}`);
    }
//    logger.debug('Full Request Object', { request: request });
    logger.info('Request Metadata', { info: request.info });
    if (request.headers && Object.keys(request.headers).length !== 0) {
      logger.info('Request Headers', { headers: request.headers });
    }
    if (request.payload && Object.keys(request.payload).length !== 0) {
      logger.info('Request Payload', { payload: request.payload });
    }
    if (request.query && Object.keys(request.query).length !== 0) {
      logger.info('Request Query Parameters', { query: request.query });
    }
    if (request.params && Object.keys(request.params).length !== 0) {
      logger.info('Request Path Parameters', { params: request.params });
    }
    return h.continue;
  },
};
