export type LoggerContext = {
  context?: string;
  error?: Error;
  [key: string]: {} | null | undefined;
}

export type LoggerMetadata = {
  name: string;
  logLevel: string;
  env: string;
}

export abstract class Logger {
  protected constructor(protected loggerMetadata: LoggerMetadata, public context?: LoggerContext) {
  }

  setContext(context: LoggerContext): void {
    this.context = context;
  }

  getContext(): LoggerContext | false {
    return this.context ?? false;
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
