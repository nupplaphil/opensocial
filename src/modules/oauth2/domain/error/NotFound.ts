import {HttpErrorInterface} from "@core/domain/HttpErrorInterface";

export class NotFound extends Error implements HttpErrorInterface {
  httpStatus = 404;
  errorCode = "not_found";
}
