import { Logger } from '@core/util';

export abstract class UseCase<Request, Response> {
  protected constructor(protected logger: Logger) {
  }

  abstract execute(request?: Request): Promise<Response> | Response;
}
