import createTokenService from "./GetTokenService";
import {tokenService} from "@modules/oauth2/commons";
import {GetTokenController} from "@modules/oauth2/useCases/getToken/GetTokenController";
import {oauth2ClientRepository} from "@modules/oauth2/repositories";
import {userRepository} from "@modules/user/repositories";

const getTokenController = new GetTokenController(
  createTokenService(tokenService, userRepository),
  tokenService,
  oauth2ClientRepository
);

export {
  getTokenController
}
