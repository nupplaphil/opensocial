import {userRepository} from "@modules/user/repositories";

import createWebfingerService from "./WebfingerService";
import WebfingerController from "./WebfingerController";

const webfingerController = WebfingerController(createWebfingerService(userRepository));

export {
  webfingerController
}
