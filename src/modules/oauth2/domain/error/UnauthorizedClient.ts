import {OAuthErrorInterface} from "./OAuthErrorInterface";

/**
 * The client is not authorized to request an authorization code using this method.
 */
export class UnauthorizedClient extends Error implements OAuthErrorInterface {
  httpStatus = 403;
  errorCode = "unauthorized_client";
}
