/**
 * `isOwner` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In isOwner middleware.');
    const user = ctx.state.user;
    if (user === undefined) {return await next()}
    if ( user.role.name === 'Admin' ) {
      return await next();
    } else {
      let owner = await strapi.documents('plugin::users-permissions.user').findOne({
        documentId: user.documentId,
        populate: ['customer']
      })
      const documentId = ctx.params.id? ctx.params.id : undefined;

      if (documentId) {
        const stock = await strapi.documents('api::stock.stock').findOne({
          documentId,
          populate: ['dealer']
        });

        if (owner.customer.documentId !== stock.dealer?.documentId) {
          return ctx.unauthorized('你没有权限进行操作。');
        }
      }

      await next();
    }
  };
};
