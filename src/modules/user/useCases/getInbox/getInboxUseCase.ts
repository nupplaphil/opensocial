import {UseCase} from '@core/logic';
import {GetInboxDTO} from './getInboxDTO';
import {
  AccountAlreadyExists,
  FacebookTokenInvalid,
  GoogleTokenInvalid
} from "@modules/user/useCases/getInbox/getInboxError";
import {UserRepositoryInterface} from "@modules/user/repo/UserRepositoryInterface";

type Response = any | void | GoogleTokenInvalid | FacebookTokenInvalid | AccountAlreadyExists;

export class GetInboxUseCase extends UseCase<GetInboxDTO, Promise<Response>> {
  constructor(private userRepo: UserRepositoryInterface) {
    super();
  }

  execute(request: GetInboxDTO): Promise<Response> {
    return this.userRepo.get(request.id);
  }
}
