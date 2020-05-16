import {RepositoryInterface} from "@core/domain/RepositoryInterface";

import {OAuth2Code} from "@modules/oauth2/domain";

export interface OAuth2CodesRepositoryInterface extends RepositoryInterface<OAuth2Code>{
  getByCode: (code: string) => Promise<OAuth2Code>,
  delete: (entity: OAuth2Code) => Promise<void>;
}
