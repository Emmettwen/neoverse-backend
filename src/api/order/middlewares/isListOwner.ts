/**
 * `isOwner` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (user === undefined) {return await next()}
    if ( user.role.name === 'Admin' ) {
      return await next();
    } else {
      const ownerField = config.field || 'customer';

      ctx.query.filters = {
        ...ctx.query.filters,
        [ownerField]: { documentId: { $eq: user.documentId }}
      }

      await next();
    }
  };
};
