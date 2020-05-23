import {NotImplemented} from "@curveball/http-errors";
import {Context, Middleware} from "@curveball/core";

import config from "@config/environment";
import {InvalidRequest, NotFound} from "@modules/oauth2/domain/error";

import {jrd, sendCORSHeaders, serverUrl, webFingerPath, xrd, XRD} from "../../commons/ControllerUtilities";
import {WebfingerServiceInterface} from "./WebfingerService";

export const getOptions = async (ctx: Context): Promise<void> => {
  ctx.response.body = {
    "_links": {
      "self": {"href": webFingerPath},
      "help": {
        "href": "https://webfinger.net/",
        "title": "Webfinger Specification"
      },
      "account": {
        "href": `${webFingerPath}?resource=acct:testuser2`,
        "title": "Search for account"
      },
      "user": {
        "href": `${webFingerPath}?resource=${serverUrl}/users/2`,
        "title": "Search for user"
      },
    }
  };
};

export const getWebfinger = (webfingerService: WebfingerServiceInterface) => async (ctx: Context): Promise<void> => {
  sendCORSHeaders(ctx);

  try {
    if (!ctx.request.query.resource) {
      return getOptions(ctx);
    }

    const user = await webfingerService.getAccount(ctx.request.query.resource.toLowerCase());

    const host = config.get('server').host;

    const subject = `acct:${user.username}@${host}`;
    const self = {
      rel: 'self',
      type: 'application/activity+json',
      href: `${serverUrl}/users/${user.id}`
    };
    const profilePage = {
      rel: 'http://webfinger.net/rel/profile-page',
      type: 'text/html',
      href: `${serverUrl}/@${user.username}`
    };
    const subscribe = {
      rel: 'http://ostatus.org/schema/1.0/subscribe',
      template: `${serverUrl}/authorize-follow?acct={uri}`
    };

    if (ctx.accepts(jrd, xrd) === xrd) {
      ctx.response.body = XRD(
        { element: 'Subject', value: subject },
        { element: 'Link', attributes: self },
        { element: 'Link', attributes: profilePage },
        { element: 'Link', attributes: subscribe });
      ctx.response.type = xrd;
    } else {
      ctx.response.body = {
        subject,
        links: [self, profilePage, subscribe]
      };
      ctx.response.type = jrd;
    }

    ctx.response.headers.set('Cache-Control', 'public, max-age=180');
  }catch (err) {
    if (err instanceof NotFound) {
      throw new InvalidRequest();
    } else {
      throw err;
    }
  }
};

export default function(webfingerService: Promise<WebfingerServiceInterface>): Middleware {

  return async (ctx: Context): Promise<void> => {
    const method = ctx.request.method.toLowerCase();

    switch (method) {
      case "get":
        return getWebfinger(await webfingerService)(ctx);
      default:
        throw new NotImplemented(method + ' is not implemented');
    }
  }
}
