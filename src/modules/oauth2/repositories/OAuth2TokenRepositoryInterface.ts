import {OAuth2Token} from "@modules/oauth2/domain";
import {RepositoryInterface} from "@core/domain/RepositoryInterface";

export interface OAuth2TokenRepositoryInterface extends RepositoryInterface<OAuth2Token> {
  getByRefreshToken: (refreshToken: string) => Promise<OAuth2Token>;
  getByAccessToken: (accessToken: string) => Promise<OAuth2Token>;
  save: (entity: OAuth2Token) => Promise<OAuth2Token>;
  delete: (entity: OAuth2Token) => Promise<void>;
}
