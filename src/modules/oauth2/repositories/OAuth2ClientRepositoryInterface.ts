import {OAuth2Client} from "@modules/oauth2/domain";
import {RepositoryInterface} from "@core/domain/RepositoryInterface";

export interface OAuth2ClientRepositoryInterface extends RepositoryInterface<OAuth2Client>{
  getById: (id: number) => Promise<OAuth2Client>,
  getByClient: (clientId: string) => Promise<OAuth2Client>;
  delete: (entity: OAuth2Client) => Promise<void>;
}
