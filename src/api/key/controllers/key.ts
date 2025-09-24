/**
 * key controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::key.key', ({ strapi }) =>  ({
    async bind(ctx) {
        const {id} = ctx.params;
        const { brokerName, brokerServer, transactionAccount } = ctx.request.body;
        const key = await strapi.documents('api::key.key').update({
            documentId: id,
            data: {
                brokerName,
                brokerServer,
                transactionAccount,
                binded: 'used'
            }
        })
        if (key) {
            return {
                success: true,
                key
            }
        } else {
            return ctx.badRequest('Bad request');
        }
    },
    async unbind(ctx) {
        const { id } = ctx.params;
        const res = await strapi.service('api::key.key').unbind(id)
        if (res.success) {
            ctx.body = res.data
        } else {
            ctx.badRequest(res.message)
        }
    },
    async customerUnbind(ctx){
        const { id } = ctx.params;
        await strapi.documents('api::key.key').update({
            documentId: id,
            data: {
                binded: 'unbinding'
            }
        })
        ctx.body = {
            success: true,
            message: '已提交申请'
        }
    }
}));
