import * as joi from '@hapi/joi';

export const InboxResponse = joi.object({
  status: joi.boolean().required(),
})
  .label('Inbox Response')
  .description('Response information for the inbox.');
