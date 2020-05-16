import createTokenService, {TokenServiceInterface} from "./TokenService";
import {oauth2CodeRepository, oauth2TokenRepository} from "@modules/oauth2/repositories";

const tokenService = createTokenService(oauth2TokenRepository, oauth2CodeRepository);

export {
  TokenServiceInterface,
  tokenService,
}
