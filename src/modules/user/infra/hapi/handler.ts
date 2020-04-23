import {Request, ResponseObject, ResponseToolkit} from "@hapi/hapi";
import {getInboxController} from "@modules/user/useCases/getInbox";

export const inbox = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  try {
    return await getInboxController.execute(request, h);
  } catch (e) {
    throw e;
  }
}
