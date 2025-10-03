/**
 * order service
 */

import {factories} from '@strapi/strapi';
import { errors } from '@strapi/utils';
import axios from "axios";
import dayjs from 'dayjs';

export default factories.createCoreService('api::order.order', ({ strapi }) =>  ({
    async placeOrder(user, payment, product) {
        return await strapi.documents('api::order.order').create({
            data: {
                product: product.documentId,
                qty: product.amount,
                customer: user.documentId,
                productName: product.name,
                price: product.price,
                total: product.price * product.amount,
                paymentPic: payment,
                orderStatus: 'pending',
                duration: product.duration,
            }
        })
    },
    async generateCode(orderId: string, groupId: '00'|'01'|'02'|'03' = '00') {
        const order = await strapi.documents('api::order.order').findOne({
            documentId: orderId,
            populate: ['product']
        });
        const start_date = dayjs();
        const end_date = start_date.add(order.duration, 'day');
        if (order) {
            let list = []
            const result = await axios.post('https://ea.neo-verse.cn/manage/api/generate_batch', {
                end_date: end_date.format('YYYY-MM-DD'),
                group_ids: groupId.toString(),
                count: order.qty,
                start_date: start_date.format('YYYY-MM-DD'),
            }, {
                auth: {
                    username: 'admin',
                    password: "AdminPass2025"
                }
            });
            if (result.data.success) {
                for (let i = 0; i < order.qty; i++) {
                    const key = await strapi.documents("api::key.key").create({
                        data: {
                            code: result.data.regcodes[i],
                            duration: order.duration,
                            endDate: end_date.format('YYYYMMDD'),
                        }
                    })
                    list.push(key.documentId)
                }
                return await strapi.documents('api::order.order').update({
                    documentId: orderId,
                    data: {
                        orderStatus: 'approved',
                        endDate:  end_date.format('YYYYMMDD'),
                        keys: list,
                        // @ts-ignore
                        group: 'g'+groupId,
                    }
                });
            }
        }
        return false;
    },
    async unbind(documentId: string) {
        const token = 'EA-ADMIN-2025-SECURE-TOKEN-9876543210'
        const order = await strapi.documents('api::order.order').findOne({documentId})

        try {
            const response = await axios.post('https://ea.neo-verse.cn/admin/unbind', {
                token,
                regcode: order.code
            }, {
                auth: {
                    username: 'admin',
                    password: "AdminPass2025"
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                await strapi.documents('api::order.order').update({
                    documentId,
                    data: {
                        orderStatus: 'unbind',
                        brokerName: undefined,
                        brokerServer: undefined,
                        transactionAccount: undefined,
                        endDate: undefined
                    }
                })
                return {
                    success: true,
                    data: response.data.removed
                }
            } else {
                throw new errors.ApplicationError(`解绑失败: ${response.data.error}`);
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data || error.message
            }
        }
    }
}));
