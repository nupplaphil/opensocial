import { ServerExtEventsRequestObject, ResponseObject } from '@hapi/hapi';
import { logger } from '@util';
import { Boom } from "@hapi/boom";

export const onPreResponse: ServerExtEventsRequestObject = {
  type: 'onPreResponse',
  method: (request, h) => {
    if (request.response && (request.response as Boom).isBoom) {
      const response: Boom = request.response as Boom;
//      logger.debug('Full Error Object', { response: response });
      if (response.output && response.output.payload && Object.keys(response.output.payload).length !== 0) {
        logger.alert('Error Payload', { payload: response.output.payload });
      }
      if (response.output && response.output.headers && Object.keys(response.output.headers).length !== 0) {
        logger.alert('Error Headers', { headers: response.output.headers });
      }
      if (response.output && response.output.statusCode) {
        logger.alert('Error Status Code', { statusCode: response.output.statusCode });
      }
    } else {
      const response: ResponseObject = request.response as ResponseObject;
      logger.debug('Full Response Object', { response: response });
      if (response.source) {
//        logger.info('Response Payload', { payload: response.source });
      }
      if (response.headers && Object.keys(response.headers).length !== 0) {
        logger.info('Response Headers', { headers: response.headers });
      }
      if (response.statusCode) {
        logger.info('Response Status Code', { statusCode: response.statusCode });
      }
      if (response.app && Object.keys(response.app).length !== 0) {
        logger.info('Response Application State', { app: response.app });
      }
    }
    if (request.path !== '/monitor/liveness' && request.path !== '/monitor/readiness' && !request.path.includes('swagger')) {
      logger.notice(`End: ${request.method.toUpperCase()} ${request.path}`);
    } else {
      logger.info(`End: ${request.method.toUpperCase()} ${request.path}`);
    }
    return h.continue;
  },
};
