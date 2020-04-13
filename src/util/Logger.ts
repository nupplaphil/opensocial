import config from '@config/environment';
import * as winston from 'winston';
import createDebugFormat from 'winston-format-debug';

export type LoggerContext = {
  context?: string;
  error?: Error;
  [key: string]: {} | null | undefined;
}

type LoggerMetadata = {
  name: string;
}

/// @todo Add Tests
export class Logger {
  protected winstonLogger: winston.Logger;
  context: LoggerContext = {};

  constructor(env: string, logLevel: string, appName: string) {
    const loggerMetadata: LoggerMetadata = {
      name: appName
    };

    let loggerOptions: winston.LoggerOptions;

    if (env === 'development' || env === 'unit_test') {
      loggerOptions = {
        level: logLevel,
        levels: winston.config.syslog.levels,
        defaultMeta: loggerMetadata,
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              createDebugFormat({
                levels: winston.config.syslog.levels,
                colors: winston.config.syslog.colors
              })
            )
          })
          ]
      };
    } else {
      loggerOptions = {
        level: logLevel,
      };
    }

    this.winstonLogger = winston.createLogger(loggerOptions);
  }

  public setContext(context: LoggerContext): void {
    this.context = context;
  }

  public getContext(): LoggerContext | false {
    return this.context ?? false;
  }

  public emerg(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.emerg({ message, context });
    }
  }

  public alert(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.alert({ message, context });
    }
  }

  public crit(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.crit({ message, context });
    }
  }

  public error(message: string, context: LoggerContext = this.context): void {
    if (config.get('enableLogs')) {
      this.winstonLogger.error({ message, context });
    }
  }

  public warning(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.warning({ message, context });
    }
  }

  public notice(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.notice({ message, context });
    }
  }

  public info(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.info({ message, context });
    }
  }

  public debug(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.debug({ message, context });
    }
  }
}

export const logger = new Logger(config.get('env'), config.get('logLevel'), config.get('name'));
