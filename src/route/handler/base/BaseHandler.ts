import { logger } from '@util/Logger';
import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';
import { Boom, boomify } from "@hapi/boom";
import { ExtendedError } from '@util/ExtendedError';
import Rethrow from '@util/Rethrow';

abstract class BaseHandler {
  protected request: Request;

  protected h: ResponseToolkit;

  constructor(request: Request, h: ResponseToolkit) {
    this.request = request;
    this.h = h;
  }

  protected respondSuccess(response: ResponseObject): ResponseObject {
    return response;
  }

  protected respondError(error?: Error | ExtendedError | Rethrow): Boom {
    if (!error) {
      return new Boom();
    }

    logger.info('Full Error Object', { error: error });

    if (error.stack) {
      logger.alert('Error Stack', { error: error });
    } else {
      logger.alert('No Error stack to log');
    }

    if (error.hasOwnProperty('options') && (error as ExtendedError).options.http) {
      return boomify(error, (error as ExtendedError).options.http);
    }

    return new Boom(error);
  }
}

export default BaseHandler;
