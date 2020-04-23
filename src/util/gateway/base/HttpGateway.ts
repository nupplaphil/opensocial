import Axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {createLogger} from '@util';
import {ExtendedError, Rethrow} from '@core/util';
import BaseGateway from './BaseGateway';

const LOGGER = createLogger('HTTPGateway');

export abstract class HttpGateway extends BaseGateway {
  private instance: HttpInstance;

  constructor(httpOpts?: HttpRequestConfig | undefined) {
    super();
    if (httpOpts) {
      LOGGER.debug('[HttpGateway] Instance Options', { options: httpOpts });
      this.instance = Axios.create(httpOpts);
    } else {
      this.instance = Axios.create();
    }
  }

  protected async httpGet(url: string, config?: HttpRequestConfig): Promise<HttpResponse> {
    this.logRequest('GET', url, null, config);
    let response: HttpResponse;
    try {
      response = await this.instance.get(url, config);
    } catch (e) {
      HttpGateway.logError(e);
      throw e;
    }
    HttpGateway.logResponse(response);
    return response;
  }

  protected async httpPost(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse> {
    this.logRequest('POST', url, data, config);
    let response: HttpResponse;
    try {
      response = await this.instance.post(url, data, config);
    } catch (e) {
      HttpGateway.logError(e);
      throw e;
    }
    HttpGateway.logResponse(response);
    return response;
  }

  protected async httpPut(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse> {
    this.logRequest('PUT', url, data, config);
    let response: HttpResponse;
    try {
      response = await this.instance.put(url, data, config);
    } catch (e) {
      HttpGateway.logError(e);
      throw e;
    }
    HttpGateway.logResponse(response);
    return response;
  }

  protected async httpPatch(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse> {
    this.logRequest('PATCH', url, data, config);
    let response: HttpResponse;
    try {
      response = await this.instance.patch(url, data, config);
    } catch (e) {
      HttpGateway.logError(e);
      throw e;
    }
    HttpGateway.logResponse(response);
    return response;
  }

  protected async httpDelete(url: string, config?: HttpRequestConfig): Promise<HttpResponse> {
    this.logRequest('DELETE', url, null, config);
    let response: HttpResponse;
    try {
      response = await this.instance.delete(url, config);
    } catch (e) {
      HttpGateway.logError(e);
      throw e;
    }
    HttpGateway.logResponse(response);
    return response;
  }

  protected handleError(error: any): ExtendedError {
    if (error.response) {
      return new ExtendedError('[HttpGateway] Endpoint responded with a status code that falls out of the range of 2xx', {
        http: {
          statusCode: error.response.status ? error.response.status : 500,
          message: JSON.stringify(error.response.data ? error.response.data : '[HttpGateway] API responded with an error'),
        },
      });
    }

    if (error.request) {
      return new ExtendedError('[HttpGateway] Something happened in setting up the request that triggered an Error', {
        http: {
          statusCode: 500,
          message: '[HttpGateway] Error setting up request',
        },
      });
    }

    return new Rethrow('[HttpGateway] Generic error occurred', error, {
      http: {
        statusCode: 500,
        message: '[HttpGateway] Generic error occurred',
      },
    });
  }

  private logRequest(method: string, url: string, data: any,
    config: HttpRequestConfig | undefined): void {
    if (!config) {
      config = {};
    }
    if (this.instance.defaults.baseURL) {
      LOGGER.info(`[HttpGateway] BEGIN ${method.toUpperCase()} ${this.instance.defaults.baseURL}${url}`);
    } else {
      LOGGER.info(`[HttpGateway] BEGIN ${method.toUpperCase()} ${url}`);
    }

    if (this.instance.defaults.headers || (config && config.headers)) {
      LOGGER.info('[HttpGateway] Request Headers:');
      LOGGER.info(Object.assign(this.instance.defaults.headers
        ? this.instance.defaults.headers : {},
        config.headers ? config.headers : {}));
    }

    if (data) {
      LOGGER.info('[HttpGateway] Request Payload:');
      LOGGER.info(data);
    }

    if (this.instance.defaults.params || (config && config.params)) {
      LOGGER.info('[HttpGateway] Request Query Parameters:');
      LOGGER.info(Object.assign(this.instance.defaults.params
        ? this.instance.defaults.params : {}, config.params ? config.params : {}));
    }
  }

  private static logResponse(response: HttpResponse): void {
    LOGGER.debug('[HttpGateway] Full Response Object', { response: response });

    if (response.headers) {
      LOGGER.info('[HttpGateway] Response Headers', { headers: response.headers });
    }

    if (response.data) {
      LOGGER.info('[HttpGateway] Response Payload', { payload: response.data });
    }

    if (response.status) {
      LOGGER.info('[HttpGateway] Status Code', { statusCode: response.status });
    }

    if (response.config.method) {
      LOGGER.info(`[HTTPGateway] END ${response.config.method!.toUpperCase()} ${response.config.url}`);
    }
  }

  private static logError(error: any): void {
    LOGGER.debug('[HttpGateway] Full Error Object', { error: error });
    if (error.response) {
      LOGGER.alert('[HttpGateway] Endpoint responded with a status code that falls out of the range of 2xx');
      LOGGER.debug('[HttpGateway] Full Error Response Object', { response: error.response });
      if (error.response.status) {
        LOGGER.alert('[HttpGateway] Error Response Status Code', { statusCode: error.response.statusCode });
      }
      if (error.response.headers) {
        LOGGER.alert('[HttpGateway] Error Response Headers', { headers: error.response.headers });
      }
      if (error.response.data) {
        LOGGER.alert('[HttpGateway] Error Response Payload', { payload: error.response.data });
      }
    } else if (error.request) {
      LOGGER.alert('[HttpGateway] Something happened in setting up the request that triggered an Error');
      LOGGER.debug('[HttpGateway] Full Error Request Object', { request: error.request });
    } else {
      LOGGER.alert('[HttpGateway] Generic error occurred');
    }
    LOGGER.info('[HttpGateway] Error Config', { config: error.config });
  }
}

export type HttpInstance = AxiosInstance

export type HttpResponse = AxiosResponse

export type HttpRequestConfig = AxiosRequestConfig
