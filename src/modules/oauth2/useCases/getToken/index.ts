import {userRepository} from "@modules/user/repositories";
import {oauth2ClientRepository, oauth2CodeRepository, oauth2TokenRepository} from "@modules/oauth2/repositories";

import createTokenService from "./GetTokenService";
import GetTokenController from "./GetTokenController";

const getTokenController = GetTokenController(
  createTokenService(oauth2TokenRepository, oauth2CodeRepository, userRepository),
  oauth2ClientRepository
);

export {
  getTokenController
}
