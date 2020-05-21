import {invokeMiddlewares, Middleware} from "@curveball/core";
import session from "@curveball/session";
import bodyParser from "@curveball/bodyparser";
import halBrowser from "hal-browser";
import problem from "@curveball/problem";
import {login} from "./middlewares";

import config from "@config/environment";
import {routes} from "./routes";

export default function (): Middleware {
  const middlewares = [
    halBrowser({
      title: config.get('name')
    }),
    problem(),
    session({
      store: "memory"
    }),
    login,
    bodyParser(),
    ...routes,
  ];

  return (ctx): Promise<void> => {
    return invokeMiddlewares(ctx, middlewares);
  }
}
