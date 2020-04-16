import config from '@config/environment';
import { logger } from '@util';
import { setSignals, globalRouteOptions, plugins } from '@http/config';
import { Rethrow } from '@core/util';
import { hooks } from '@http/hook';
import routes from '@http/routes';
import { Server } from '@hapi/hapi';

logger.setContext({ context: 'boot'});

let server: Server;

async function main(): Promise<void> {
  try {
    server = new Server({
      host: config.get('host'),
      port: config.get('port'),
      routes: globalRouteOptions,
    });
    if (server.info) {
      server.info.protocol = config.get('protocol') as 'http' | 'https' | 'socket';
    } else {
      throw new Error('Server info is null');
    }
  } catch (e) {
    throw new Rethrow('Problem creating server', e);
  }

  try {
    await server.register(plugins);
  } catch (e) {
    throw new Rethrow('Problem registering plugins', e);
  }

  try {
    await server.ext(hooks);
  } catch (e) {
    throw new Rethrow('Problem creating lifecycle hooks', e);
  }

  try {
    server.route(routes);
  } catch (e) {
    throw new Rethrow('Problem creating routes', e);
  }

  try {
    await server.start();
  } catch (e) {
    throw new Rethrow('Problem starting server', e);
  }

  try {
    setSignals(server);
  } catch (e) {
    throw new Rethrow('Problem setting system signals', e);
  }
}

// Execute main function
main().then(() => {
  logger.notice(`Server started at: ${server.info.uri}`);
  logger.notice(`API docs available at: ${server.info.uri}/documentation`);
}).catch((e) => {
  logger.emerg('Fatal error during init', { context: 'shutdown', error: e });
  process.exit(1);
});
