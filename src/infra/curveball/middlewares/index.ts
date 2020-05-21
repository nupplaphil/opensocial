import Login from "./Login";
import {oauth2TokenRepository} from "@modules/oauth2/repositories";

const login = Login(oauth2TokenRepository);

export {
  login
}
