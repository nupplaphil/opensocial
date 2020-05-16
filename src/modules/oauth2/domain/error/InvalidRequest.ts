import {OAuthErrorInterface} from "./OAuthErrorInterface";

/**
 * The request is missing a required parameter, includes an invalid paramter
 * value, includes a parameter more than once or is otherwise malformed.
 */
export class InvalidRequest extends Error implements OAuthErrorInterface {
  httpStatus = 400;
  errorCode = "invalid_request";
}
