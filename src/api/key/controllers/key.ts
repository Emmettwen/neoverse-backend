/**
 * key controller
 */

import { factories } from '@strapi/strapi'
import axios from "axios";

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
    },
    async verify(ctx) {
        const { regcode } = ctx.request.body;
        const result = await axios.post('https://ea.neo-verse.cn/manage/api/validate_regcode', {
            regcode: regcode
        }, {
            auth: {
                username: 'admin',
                password: "AdminPass2025"
            }
        });
        if (result.data.success) {
            return result.data;
        } else {
            ctx.badRequest('Bad request');
        }
    },
    async check(ctx) {
        const { id:documentId } = ctx.params;
        const key = await strapi.documents('api::key.key').findOne({
            documentId
        })
        if (key) {
            return await strapi.service('api::key.key').checkInformation(key);
        } else {
            return ctx.badRequest('Bad request');
        }
    }
}));
