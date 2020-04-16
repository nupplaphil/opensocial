import config from '@config/environment';
import * as winston from 'winston';
import createDebugFormat from 'winston-format-debug';
import { Logger, LoggerContext, LoggerMetadata } from "@core/util/Logger";

/// @todo Add Tests
export class WinstonLogger extends Logger {
  protected winstonLogger: winston.Logger;

  constructor(loggerMetadata: LoggerMetadata, context?: LoggerContext) {
    super(loggerMetadata, context);

    let loggerOptions: winston.LoggerOptions;

    if (loggerMetadata.env === 'development' || loggerMetadata.env === 'unit_test') {
      loggerOptions = {
        level: loggerMetadata.logLevel,
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
        level: loggerMetadata.logLevel,
      };
    }

    this.winstonLogger = winston.createLogger(loggerOptions);
  }

  emerg(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.emerg({ message, context });
    }
  }

  alert(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.alert({ message, context });
    }
  }

  crit(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.crit({ message, context });
    }
  }

  error(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      this.winstonLogger.error({ message, context });
    }
  }

  warning(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.warning({ message, context });
    }
  }

  notice(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.notice({ message, context });
    }
  }

  info(message: string, context?: LoggerContext): void {
    if (config.get('enableLogs')) {
      if (!context) {
        context = this.context;
      } else {
        context = (context ? Object.assign(context, this.context) : this.context) as LoggerContext;
      }
      this.winstonLogger.info({ message, context });
    }
  }

  debug(message: string, context?: LoggerContext): void {
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

