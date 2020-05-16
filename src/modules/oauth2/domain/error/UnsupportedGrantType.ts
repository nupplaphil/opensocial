import {OAuthErrorInterface} from "./OAuthErrorInterface";

/**
 * The authorization grant type is not supported by the authorization server.
 */
export class UnsupportedGrantType extends Error implements OAuthErrorInterface {
  httpStatus = 400;
  errorCode = "unsupported_grant_type";
}
