import * as joi from '@hapi/joi';

export const accountResponse = joi.object().keys({
  subject: joi.string().required(),
  links: joi.array().items(
    joi.object().keys({
      rel: joi.string().required(),
      type: joi.string().required(),
      href: joi.string().required(),
    }),
  ),
});
