import {UseCaseError} from '@core/logic/UseCaseError';

export class AccountAlreadyExists extends UseCaseError {
  constructor (email: string) {
    super(`The email ${email} associated for this account already exists`)
  }
}

export class FacebookTokenInvalid extends UseCaseError {
  constructor () {
    super(`The facebook token used to attempt to create an account not genuine.`);
  }
}

export class GoogleTokenInvalid extends UseCaseError {
  constructor() {
    super(`The google token used to attempt to create an account not genuine.`);
  }
}
