/**
 * `isOwner` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In isListOwner middleware.');
    const user = ctx.state.user;
    if (user === undefined) {return await next()}
    if ( user.role.name === 'Admin' ) {
      return await next();
    } else {
      let owner = await strapi.documents('plugin::users-permissions.user').findOne({
        documentId: user.documentId,
        populate: ['customer']
      })

      const ownerField = config.field || 'dealer';

      ctx.query.filters = {
        ...ctx.query.filters,
        [ownerField]: { documentId: { $eq: owner.customer.documentId }}
      }

      await next();
    }
  };
};
