import { getLivenessController } from '../../useCases/getLiveness';
import { getReadinessController } from '../../useCases/getReadiness';
import {Request, ResponseObject, ResponseToolkit} from "@hapi/hapi";

export const liveness = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  try {
    return await getLivenessController.execute(request, h);
  } catch (e) {
    throw e;
  }
}

export const readiness = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  try {
    return await getReadinessController.execute(request, h);
  } catch (e) {
    throw e;
  }
}
