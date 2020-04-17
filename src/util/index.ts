import config from "@config/environment";
import { WinstonLogger } from "@util/WinstonLogger";

export const logger = new WinstonLogger({env: config.get('env'), logLevel: config.get('logLevel'), name: config.get('name')});
