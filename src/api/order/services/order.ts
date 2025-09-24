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
    async generateCode(orderId: string, groupId: string = '00') {
        const order = await strapi.documents('api::order.order').findOne({
            documentId: orderId,
            populate: ['product']
        });
        const start_date = dayjs();
        const end_date = start_date.add(order.duration, 'day');
        if (order) {
            let list = []
            let dateInfo = {
                end_date: end_date.format('YYYYMMDD'),
                generated_at: dayjs().format('YYYYMMDDHHmmss')
            }
            for (let i = 0; i < order.qty; i++) {
                const result = await axios.post('https://ea.neo-verse.cn/manage/api/generate_single', {
                    end_date: end_date.format('YYYY-MM-DD'),
                    group_id: groupId,
                    start_date: start_date.format('YYYY-MM-DD'),
                });
                console.log(result.data.regcode);
                if (result.data.success) {
                    const key = await strapi.documents("api::key.key").create({
                        data: {
                            code: result.data.regcode,
                            duration: order.duration,
                            endDate: result.data.validation.data.end_date,
                            generatedDate: dayjs(result.data.validation.data.generated_at, 'YYYYMMDDHHmmss').toDate(),
                        }
                    })
                    list.push(key.documentId)
                    dateInfo = result.data.validation.data
                }
            }
            return await strapi.documents('api::order.order').update({
                documentId: orderId,
                data: {
                    orderStatus: 'approved',
                    endDate: dateInfo.end_date,
                    keys: list,
                    //@ts-ignore
                    group: 'g'+groupId,
                    generatedDate: dayjs(dateInfo.generated_at, 'YYYYMMDDHHmmss').toDate(),
                }
            });
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
