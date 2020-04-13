import { ServerRoute } from '@hapi/hapi';
import * as monitor from './monitor';
import webfinger from './wellknown';

const routes: ServerRoute[] = [
  monitor.liveness,
  monitor.readiness,
  webfinger,
];

export default routes;
