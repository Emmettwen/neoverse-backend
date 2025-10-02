
export default {
    routes: [
        {
            method: 'POST',
            path: '/keys/:id/bind',
            handler: 'key.bind',
        },
        {
            method: 'POST',
            path: '/keys/:id/unbind',
            handler: 'key.unbind',
        },
        {
            method: 'POST',
            path: '/keys/:id/customer-unbind',
            handler: 'key.customerUnbind',
        },
        {
            method: 'POST',
            path: '/keys/verify',
            handler: 'key.verify',
        }
    ]
}