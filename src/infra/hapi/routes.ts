import {Server} from "@hapi/hapi";

import * as monitor from "@modules/monitor/infra/hapi/routes";
import * as user from '@modules/user/infra/hapi/routes';

const routes = function (server: Server): void {
  server.route(monitor.routes);
  server.route(user.routes);
}

export default routes;
