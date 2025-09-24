
export default {
    routes: [
        { // Path defined with a URL parameter
            method: 'POST',
            path: '/orders/place',
            handler: 'order.placeOrder',
        },
        {
            method: 'POST',
            path: '/orders/:id/approve',
            handler: 'order.approve',
        },
        {
            method: 'POST',
            path: '/orders/:id/bind',
            handler: 'order.bind',
        },
        {
            method: 'POST',
            path: '/orders/:id/unbind',
            handler: 'order.unbind',
        },
        {
            method: 'POST',
            path: '/orders/:id/customer-unbind',
            handler: 'order.customerUnbind',
        }
    ]
}