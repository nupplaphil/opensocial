import { ServerRoute } from "@hapi/hapi";

import { readiness, liveness } from "@modules/monitor/infra/hapi/routes";

const routes: ServerRoute[] = [
  readiness,
  liveness,
];

export default routes;
