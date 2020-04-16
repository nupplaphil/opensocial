import { GetLivenessController } from './GetLivenessController';
import { logger } from '@util';

const getLivenessController = new GetLivenessController(logger);

export {
  getLivenessController
}
