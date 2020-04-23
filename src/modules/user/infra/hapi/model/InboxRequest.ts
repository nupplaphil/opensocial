import * as joi from '@hapi/joi';

export const InboxRequest = joi.object({
  status: joi.boolean().required(),
})
  .label('Inbox Request')
  .description('Request information for the inbox.');
