import {OAuthErrorInterface} from "./OAuthErrorInterface";

/**
 * The provided authorization grant (e.g., authorization code, resource owner
 * credentials) or refresh token is invalid, expired, revoked, does not match
 * the redirection URI used in the authorization request, or was issued to
 * another client
 */
export class InvalidGrant extends Error implements OAuthErrorInterface {
  httpStatus = 400;
  errorCode = "invalid_grant";
}
