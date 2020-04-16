import * as joi from '@hapi/joi';

export const monitorResponse = joi.object({
  status: joi.boolean().required(),
})
  .label('Monitor Response')
  .description('Holds the status of a requested Monitor status');
