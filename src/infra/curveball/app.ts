import {Application} from "@curveball/core";
import config from "@config/environment";
import {accessLog} from "@curveball/accesslog";
import middleware from './middleware';

export async function create(): Promise<Application> {
  const app = new Application();
  app.use(middleware());
  app.use(accessLog());

  return app;
}

export async function start(): Promise<void> {
  const app = await create();
  const port = config.get('server').port;

  app.listen(port);

  console.log('Listening on port', port)
}

export default {
  create, start
};
