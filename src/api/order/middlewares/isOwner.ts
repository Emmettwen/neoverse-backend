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
      const documentId = ctx.params.id? ctx.params.id : undefined;

      if (documentId) {
        const order = await strapi.documents('api::order.order').findOne({
          documentId,
          populate: ['customer']
        });

        if (user.documentId !== order.customer?.documentId) {
          return ctx.unauthorized('你没有权限进行操作。');
        }
      }

      await next();
    }
  };
};
