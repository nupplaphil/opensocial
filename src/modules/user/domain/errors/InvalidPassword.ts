import {HttpErrorInterface} from "@core/domain/HttpErrorInterface";

/**
 * The provided password doesn't match to a given user
 */
export class InvalidPassword extends Error implements HttpErrorInterface{
  httpStatus = 400;
  errorCode = "invalid_password";
}
