/**
 * order service
 */

import {factories} from '@strapi/strapi';
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
                duration: product.duration * product.amount,
            }
        })
    },
    async generateCode(orderId: string) {
        const order = await strapi.documents('api::order.order').findOne({
            documentId: orderId,
            populate: ['product']
        });
        const start_date = dayjs();
        const end_date = start_date.add(order.duration, 'day');
        if (order) {
            const result = await axios.post('https://ea.pseedr.com/manage/api/generate_single', {
                end_date: end_date.format('YYYY-MM-DD'),
                group_id: '01',
                start_date: start_date.format('YYYY-MM-DD'),
            });
            if (result.data.success) {
                return await strapi.documents('api::order.order').update({
                    documentId: orderId,
                    data: {
                        code: result.data.regcode,
                        orderStatus: 'approved',
                        endDate: result.data.validation.data.end_date,
                        generatedDate: dayjs(result.data.validation.data.generated_at, 'YYYYMMDDHHmmss').toDate(),
                    }
                });
            }
        }
        return false;
    }
}));
