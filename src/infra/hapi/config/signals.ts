import {createLogger} from '@util';
import {Server} from '@hapi/hapi';

const LOGGER = createLogger('HAPI Signals');

export const setSignals = function (server: Server): void {
  // Catch unhandled uncaught exceptions
  process.on('uncaughtException', (e: Error) => {
    LOGGER.alert('uncaughtException', { error: e });
  });

  // Catch unhandled rejected promises
  process.on('unhandledRejection', (reason: {} | null | undefined) => {
    LOGGER.alert('unhandledRejection', { reason: reason });
  });

  // Catch system signals and gracefully stop application
  process.on('SIGINT', async () => {
    LOGGER.notice('Caught SIGINT. Gracefully stopping application');

    try {
      await server.stop();
    } catch (e) {
      LOGGER.alert('Unable to stop application gracefully. Forcefully killing process', { error: e });
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    LOGGER.notice('Caught SIGTERM. Gracefully stopping application');

    try {
      await server.stop();
    } catch (e) {
      LOGGER.alert('Unable to stop application gracefully. Forcefully killing process', { error: e });
      process.exit(1);
    }
  });
};
