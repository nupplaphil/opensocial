import {escapeAttribute, escapeValue} from "../../../commons/XML";
import {Context} from "@curveball/core";
import config from "@config/environment";

export const XRD = (...x: { element: string, value?: string, attributes?: Record<string, string> }[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?><XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">${x.map(({ element, value, attributes }) =>
    `<${
      Object.entries(typeof attributes === 'object' && attributes || {}).reduce((a, [k, v]) => `${a} ${k}="${escapeAttribute(v)}"`, element)
    }${
      typeof value === 'string' ? `>${escapeValue(value)}</${element}` : '/'
    }>`).reduce((a, c) => a + c, '')}</XRD>`;

export const allPath = '/.well-known/*';
export const webFingerPath = '/.well-known/webfinger';
export const jrd = 'application/jrd+json';
export const xrd = 'application/xrd+xml';

const serverConfig = config.get('server');
export const serverUrl = serverConfig.protocol + '://' + serverConfig.host + ':' + serverConfig.port;

export const sendCORSHeaders = (ctx: Context): void  => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set('Access-Control-Allow-Headers', 'Accept');
  ctx.response.headers.set('Access-Control-Allow-Methods', ['GET, OPTIONS']);
  ctx.response.headers.set('Access-Control-Expose-Headers', 'Vary');
}
