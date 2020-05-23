import {Context, Middleware} from "@curveball/core";
import {NotImplemented} from "@curveball/http-errors";
import {
  jrd,
  sendCORSHeaders,
  serverUrl,
  webFingerPath,
  XRD,
  xrd
} from "@modules/serverInfo/commons/ControllerUtilities";
import {InvalidRequest} from "@modules/oauth2/domain/error";

export const get = () => async (ctx: Context): Promise<void> => {
  sendCORSHeaders(ctx);

  switch (ctx.request.path) {
    case '/.well-known/host-meta':
      ctx.response.headers.set('Content-Type', xrd);
      ctx.response.body = XRD({
        element: "Link",
        attributes: {
          type: xrd,
          template: serverUrl + webFingerPath + "?resource={uri}",
        }
      })
      break;
    case '/.well-known/host-meta.json':
      ctx.response.headers.set('Content-Type', jrd);
      ctx.response.body = {
        links: [{
          rel: 'lrdd',
          type: jrd,
          template: serverUrl + webFingerPath + "?resource={uri}",
        }],
      };
      break;
    default:
      throw new InvalidRequest();
  }
};

export default function(
): Middleware {

  return async (ctx: Context): Promise<void> => {
    const method = ctx.request.method.toLowerCase();

    switch (method) {
      case "get":
        return get()(ctx);
      default:
        throw new NotImplemented(method + ' is not implemented');
    }
  }
}
