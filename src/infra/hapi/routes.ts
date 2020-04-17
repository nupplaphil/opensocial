import { Server } from "@hapi/hapi";

import * as monitor from "@modules/monitor/infra/hapi/routes";

const routes = function (server: Server) {
  server.route(monitor.routes);
}

export default routes;
