import router from "@curveball/router";
import {allPath, webFingerPath} from "@modules/serverInfo/commons/ControllerUtilities";
import {Context, Middleware} from "@curveball/core";
import GetHostMetaController from "@modules/serverInfo/useCases/getHostMeta/GetHostMetaController";
import {webfingerController} from "@modules/serverInfo/useCases/webfinger";

const hostMetaXrdRoute = router('/.well-known/host-meta', GetHostMetaController());
const hostMetaJrdRoute = router('/.well-known/host-meta.json', GetHostMetaController());
const webfingerRoute = router(webFingerPath, webfingerController);
const optionsRoute = router(allPath).options(async (ctx: Context) => {
  ctx.response.status = 204;
});

export const serverInfoRoutes: Middleware[] = [
  hostMetaXrdRoute,
  hostMetaJrdRoute,
  webfingerRoute,
  optionsRoute
];
