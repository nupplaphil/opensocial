import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';
import BaseHandler from '@route/handler/base/BaseHandler';
import * as models from '@route/model';

class MonitorHandler extends BaseHandler {
  async liveness(): Promise<ResponseObject> {
    const res: models.MonitorResponse = {
      status: true,
    };
    return this.respondSuccess(this.h.response(res));
  }

  async readiness(): Promise<ResponseObject> {
    const res: models.MonitorResponse = {
      status: true,
    };
    return this.respondSuccess(this.h.response(res));
  }
}

export const liveness = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => new MonitorHandler(request, h).liveness();

export const readiness = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => new MonitorHandler(request, h).readiness();
