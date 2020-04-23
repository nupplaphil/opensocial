import {ResponseObject, ServerExtEventsRequestObject} from '@hapi/hapi';
import {createLogger} from '@util';
import {Boom} from "@hapi/boom";

const LOGGER = createLogger('OnPreResponse');

export const onPreResponse: ServerExtEventsRequestObject = {
  type: 'onPreResponse',
  method: (request, h) => {
    if (request.response && (request.response as Boom).isBoom) {
      const response: Boom = request.response as Boom;
//      LOGGER.debug('Full Error Object', { response: response });
      if (response.output && response.output.payload && Object.keys(response.output.payload).length !== 0) {
        LOGGER.alert('Error Payload', { payload: response.output.payload });
      }
      if (response.output && response.output.headers && Object.keys(response.output.headers).length !== 0) {
        LOGGER.alert('Error Headers', { headers: response.output.headers });
      }
      if (response.output && response.output.statusCode) {
        LOGGER.alert('Error Status Code', { statusCode: response.output.statusCode });
      }
    } else {
      const response: ResponseObject = request.response as ResponseObject;
      //LOGGER.debug('Full Response Object', { response: response });
      if (response.source) {
        //LOGGER.info('Response Payload', { payload: response.source });
      }
      if (response.headers && Object.keys(response.headers).length !== 0) {
        LOGGER.info('Response Headers', { headers: response.headers });
      }
      if (response.statusCode) {
        LOGGER.info('Response Status Code', { statusCode: response.statusCode });
      }
      if (response.app && Object.keys(response.app).length !== 0) {
        LOGGER.info('Response Application State', { app: response.app });
      }
    }
    if (request.path !== '/monitor/liveness' && request.path !== '/monitor/readiness' && !request.path.includes('swagger')) {
      LOGGER.notice(`End: ${request.method.toUpperCase()} ${request.path}`);
    } else {
      LOGGER.info(`End: ${request.method.toUpperCase()} ${request.path}`);
    }
    return h.continue;
  },
};
