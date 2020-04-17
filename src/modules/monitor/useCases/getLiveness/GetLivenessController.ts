import {BaseController} from "@core/infra";
import { MonitorDTO } from '../../dto/MonitorDTO';

export class GetLivenessController extends BaseController  {
  protected async executeImpl(): Promise<any> {
    const status: MonitorDTO = {
      status: true
    };

    return this.ok(status);
  }
}
