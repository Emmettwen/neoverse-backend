
export default {
    routes: [
        { // Path defined with a URL parameter
            method: 'POST',
            path: '/orders/place',
            handler: 'order.placeOrder',
        }
    ]
}