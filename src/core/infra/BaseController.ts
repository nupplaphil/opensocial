import {Request, ResponseObject, ResponseToolkit} from '@hapi/hapi';
import {Boom, boomify} from "@hapi/boom";
import {ExtendedError, Rethrow} from '@core/util';

export abstract class BaseController {
  private _request: Request | undefined;
  private _response: ResponseToolkit | undefined;

  get request(): Request {
    if (!this._request) {
      throw new Error("InvalidOperation: You have to execute the Controller first.");
    } else {
      return this._request;
    }
  }

  get response(): ResponseToolkit {
    if (!this._response) {
      throw new Error("InvalidOperation: You have to execute the Controller first.");
    } else {
      return this._response;
    }
  }

  protected abstract async executeImpl(): Promise<void | any>;

  async execute(request: Request, response: ResponseToolkit ): Promise<ResponseObject> {
    this._request = request;
    this._response= response;

    return this.executeImpl()
  }

  private respondError(error?: Error | ExtendedError | Rethrow): Boom {
    if (!error) {
      return new Boom();
    }

    if (error.hasOwnProperty('options') && (error as ExtendedError).options.http) {
      return boomify(error, (error as ExtendedError).options.http);
    }

    return new Boom(error);
  }

  protected ok(dto: object): ResponseObject {
    return this.response.response(dto);
  }
}
