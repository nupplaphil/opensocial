import {OAuthErrorInterface} from "./OAuthErrorInterface";

/**
 * The resource owner or authorization server denied the request.
 */
export class AccessDenied extends Error implements OAuthErrorInterface {
  httpStatus = 403;
  errorCode = "unauthorized_client";
}
