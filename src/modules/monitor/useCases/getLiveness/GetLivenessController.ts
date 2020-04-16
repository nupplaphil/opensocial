import {BaseController} from "@core/infra";
import {LivenessDTO} from "@modules/monitor/useCases/getLiveness/GetLivenessDTO";

export class GetLivenessController extends BaseController  {
  protected async executeImpl(): Promise<any> {
    const status: LivenessDTO = {
      status: true
    };

    return this.ok(status);
  }
}
