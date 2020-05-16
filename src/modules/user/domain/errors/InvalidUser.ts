import {HttpErrorInterface} from "@core/domain/HttpErrorInterface";

/**
 * The provided credentials or arguments doesn't match to a user
 */
export class InvalidUser extends Error implements HttpErrorInterface{
  httpStatus = 400;
  errorCode = "invalid_user";
}
