/**
 * `updateKeyStatus` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    // Add your own logic here.
    return async (ctx, next) => {
        strapi.log.info('In updateKeyStatus middleware.');
        await next();
        if (Array.isArray(ctx.body.data)) {
            ctx.body.data.map(async (key) => {
                return await strapi.service('api::key.key').checkInformation(key);
            })
        }
    };
};
