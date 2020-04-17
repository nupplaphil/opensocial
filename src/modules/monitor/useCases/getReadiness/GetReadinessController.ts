import { BaseController } from '@core/infra';
import { ReadinessDTO } from './GetReadinessDTO';

export class GetReadinessController extends BaseController  {
  protected async executeImpl(): Promise<any> {
    const status: ReadinessDTO = {
      status: true
    };

    return this.ok(status);
  }
}
