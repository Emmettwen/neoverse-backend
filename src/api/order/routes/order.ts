/**
 * order router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::order.order', {
    config: {
        update: {
            middlewares: ["api::order.is-owner"],
        },
        findOne: {
            middlewares: ["api::order.is-owner"],
        },
        delete: {
            middlewares: ["api::order.is-owner"],
        },
        find: {
            middlewares: [{name: "api::order.is-list-owner", config: {field: 'customer'}}],
        }
    }
});
