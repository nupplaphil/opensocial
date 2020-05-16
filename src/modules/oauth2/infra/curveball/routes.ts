import router from "@curveball/router";
import {getTokenController} from "@modules/oauth2/useCases/getToken";

const tokenRoute = router('/token', getTokenController);

export {
  tokenRoute
}
