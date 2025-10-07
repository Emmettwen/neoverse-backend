/**
 * key service
 */

import { factories } from '@strapi/strapi';
import axios from "axios";
import {errors} from "@strapi/utils";
import dayjs from "dayjs";

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
    },
    async checkInformation(key){
        if(key.binded == null) {
            console.log('还未绑定')
            const lastTime = dayjs(key.generatedDate)
            const freezeTime = 60;
            if (dayjs().diff(lastTime, 's') < freezeTime) {
                console.log('查询时间太短')
                return key;
            }
            const response = await axios.get('https://ea.neo-verse.cn/admin/binding_info', {
                params: {
                    regcode: key.code
                },
                auth: {
                    username: 'admin',
                    password: "AdminPass2025"
                }
            });
            if (response.data.success) {
                const data = response.data;
                let newData:any = {
                    generatedDate: dayjs().toDate()
                }
                if (response.data.is_bound) {
                    newData.binded = 'used'
                    newData.brokerServer = data.binding_info.account_server
                    newData.brokerName = data.binding_info.terminal_company
                    newData.transactionAccount = data.binding_info.account_id
                }
                return await strapi.documents('api::key.key').update({
                    documentId: key.documentId,
                    data: newData
                })

            }
        } else {
            return key
        }
    }
}));
