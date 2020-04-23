import {BaseController} from "@core/infra";
import {GetInboxUseCase} from "@modules/user/useCases/getInbox/getInboxUseCase";
import {AccountAlreadyExists} from "@modules/user/useCases/getInbox/getInboxError";

export class GetInboxController extends BaseController {
  constructor(private useCase: GetInboxUseCase) {
    super();
  }

  protected async executeImpl(): Promise<any> {
    return new Promise((resolve, reject) => {
      //let request: GetInboxDTO;
      try {

        //request = this.request.payload as GetInboxDTO;
      } catch (e) {
        return reject(new AccountAlreadyExists('bla'));
      }

      return this.useCase.execute({id: 1});
    });
  }
}
