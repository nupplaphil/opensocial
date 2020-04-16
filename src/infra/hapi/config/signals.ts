import { logger } from '@util';
import { Server } from '@hapi/hapi';

export const setSignals = function (server: Server): void {
  // Catch unhandled uncaught exceptions
  process.on('uncaughtException', (e: Error) => {
    logger.alert('uncaughtException', { error: e });
  });

  // Catch unhandled rejected promises
  process.on('unhandledRejection', (reason: {} | null | undefined) => {
    logger.alert('unhandledRejection', { reason: reason });
  });

  // Catch system signals and gracefully stop application
  process.on('SIGINT', async () => {
    logger.setContext({ context: 'shutdown' });
    logger.notice('Caught SIGINT. Gracefully stopping application');

    try {
      await server.stop();
    } catch (e) {
      logger.alert('Unable to stop application gracefully. Forcefully killing process', { error: e });
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    logger.setContext({ context: 'shutdown' });
    logger.notice('Caught SIGTERM. Gracefully stopping application');

    try {
      await server.stop();
    } catch (e) {
      logger.alert('Unable to stop application gracefully. Forcefully killing process', { error: e });
      process.exit(1);
    }
  });
};
