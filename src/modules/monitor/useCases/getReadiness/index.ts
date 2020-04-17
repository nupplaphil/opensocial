import { GetReadinessController } from './GetReadinessController';
import { logger } from '@util';

const getReadinessController = new GetReadinessController(logger);

export {
  getReadinessController
}
