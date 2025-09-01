/**
 * order controller
 */

import { factories } from '@strapi/strapi'
import axios from "axios";

export default factories.createCoreController('api::order.order', ({ strapi }) =>  ({
    async placeOrder(ctx) {
        const { user } = ctx.state;
        if (!user) return ctx.unauthorized('请先登录！');
        const { product, payment } = ctx.request.body;
        const order = await strapi.service('api::order.order').placeOrder(user, payment, product);

        if (order) {
            return {
                success: true,
            }
        } else {
            return ctx.badRequest('Bad request');
        }
    },
    async approve(ctx) {
        const {id} = ctx.params;
        const order = await strapi.service('api::order.order').generateCode(id);
        if (order) {
            return {
                success: true,
                order
            }
        } else {
            return ctx.badRequest('Bad request');
        }
    },
    async bind(ctx) {
        const {id} = ctx.params;
        const { brokerName, brokerServer, transactionAccount } = ctx.request.body;
        const order = await strapi.documents('api::order.order').update({
            documentId: id,
            data: {
                brokerName,
                brokerServer,
                transactionAccount,
                orderStatus: 'used'
            }
        })
        if (order) {
            return {
                success: true,
                order
            }
        } else {
            return ctx.badRequest('Bad request');
        }
    }
}));
