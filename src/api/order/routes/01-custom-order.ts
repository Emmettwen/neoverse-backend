
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
        }
    ]
}