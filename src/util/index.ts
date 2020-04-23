import config from "@config/environment";
import {WinstonLogger} from "@util/WinstonLogger";
import {Logger} from "@core/util";

export const createLogger = function(domain?: string): Logger {
  return new WinstonLogger({env: config.get('env'), logLevel: config.get('logLevel'), domain: domain})
}
