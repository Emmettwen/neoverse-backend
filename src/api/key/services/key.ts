/**
 * key service
 */

import { factories } from '@strapi/strapi';
import axios from "axios";
import {errors} from "@strapi/utils";

export default factories.createCoreService('api::key.key', ({ strapi }) =>  ({
    async unbind(documentId: string) {
        const token = 'EA-ADMIN-2025-SECURE-TOKEN-9876543210'
        const key = await strapi.documents('api::key.key').findOne({documentId})

        try {
            const response = await axios.post('https://ea.neo-verse.cn/admin/unbind', {
                token,
                regcode: key.code
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                await strapi.documents('api::key.key').update({
                    documentId,
                    data: {
                        binded: 'unbind',
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
