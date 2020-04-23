export type LoggerContext = {
  error?: Error;
  [key: string]: {} | null | undefined;
}

export type LoggerMetadata = {
  domain?: string;
  logLevel?: string;
  env?: string;
}

export abstract class Logger {
  protected constructor(protected loggerMetadata: LoggerMetadata, public context?: LoggerContext) {
  }

  abstract emerg(message: string, context?: LoggerContext): void;

  abstract alert(message: string, context?: LoggerContext): void;

  abstract crit(message: string, context?: LoggerContext): void;

  abstract error(message: string, context?: LoggerContext): void;

  abstract warning(message: string, context?: LoggerContext): void;

  abstract notice(message: string, context?: LoggerContext): void;

  abstract info(message: string, context?: LoggerContext): void;

  abstract debug(message: string, context?: LoggerContext): void;
}
