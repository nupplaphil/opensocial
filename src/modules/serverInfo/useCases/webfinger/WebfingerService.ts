import {User} from "@modules/user/domain";
import {UserRepositoryInterface} from "@modules/user/repositories";
import {serverUrl} from "@modules/serverInfo/commons/ControllerUtilities";
import config from "@config/environment";
import {InvalidRequest} from "@modules/oauth2/domain/error";
import {parseAcct} from "@commons/acct";

export interface WebfingerServiceInterface {
  getAccount: (resource: string) => Promise<User>;
}

export const getAccount = (userRepo: UserRepositoryInterface) => async (resource: string): Promise<User> => {
  if (resource === null || resource === undefined) {
    throw new InvalidRequest('Invalid Request');
  }

  if (resource.startsWith(`${serverUrl.toLowerCase()}/users/`)) {
    const id = resource.split('/').pop();
    if (!id) {
      throw new InvalidRequest('Invalid Request');
    }
    return await userRepo.getActiveById(Number.parseInt(id));
  } else {
    const acct = parseAcct(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resource.startsWith(`${serverUrl.toLowerCase()}/@`) ? resource.split('/').pop()! :
        resource.startsWith('acct:') ? resource.slice('acct:'.length) :
          resource);

    if (!acct.host || acct.host === config.get('server').host.toLowerCase()) {
      return await userRepo.getByUsername(acct.username);
    } else {
      throw new InvalidRequest('Invalid Request');
    }
  }
}

export default async function (userRepo: Promise<UserRepositoryInterface>): Promise<WebfingerServiceInterface> {

  return {
    getAccount: getAccount(await userRepo),
  };
}
