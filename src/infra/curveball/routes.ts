import {tokenRoute} from "@modules/oauth2/infra/curveball/routes";
import {Middleware} from "@curveball/core";

export const routes: Middleware[] = [
  tokenRoute,
];
