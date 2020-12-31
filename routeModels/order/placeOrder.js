var User = require("../user/User")
var Order = require("./Order")
var Admin = require("../admin/Admin")
const keys = require('../../keys');
const Secret_Key = keys.Secret_Key;

const stripe = require('stripe')(Secret_Key) 


placeOrder = async (req,res) => {
    const userId = req.user._id
    try {
        var user = await User.findById(userId).populate({
            path : 'cart',
            populate : {
              path : 'product',
              model : "Product",
            }
          })
          
        var products = user.cart
        var adminId = products[0].product.user
        var admin = await Admin.findById(adminId)

        var { totalCost } = user

        var newOrder = await Order.create({ customer : user , products,totalCost ,restaurant : admin })

        user.currentOrder = newOrder

        if(user.orders.length > 10){
            user.orders = user.orders.slice(0,10) // max 10 orders at a time
        }

        user.orders.unshift(newOrder)

        user.cart = []

        user.totalCost = 0

        var savedUser = await user.save()

        var updatedUser = await User.findByIdAndUpdate(userId,savedUser)

        admin.currentOrders.unshift(newOrder)

        await admin.save()

        stripe.customers.create({ 
            email: req.body.stripeEmail, 
            source: req.body.stripeToken, 
            name: 'Gautam Sharma', 
            address: { 
                line1: 'TC 9/4 Old MES colony', 
                postal_code: '110092', 
                city: 'New Delhi', 
                state: 'Delhi', 
                country: 'India', 
            } 
        }) 
        .then((customer) => { 
            return stripe.charges.create({ 
                amount: 7000,    // Charing Rs 25 
                description: 'Web Development Product', 
                currency: 'USD', 
                customer: customer.id 
            }); 
        }) 
        const eventEmitter = req.app.get('eventEmitter')
        var data = {
            username : req.user.username,
            phoneNumber : req.user.phoneNumber,
            totalCost : req.user.totalCost,
            address : req.user.address
        } 
        console.log(data)
        eventEmitter.emit('orderPlaced', data)
        console.log("emit orderPlaces from eventEmitter")

        req.flash("success","Order placed successfully")
        res.redirect("/index")

    } catch (error) {
        console.log(error)
        req.flash("error","Cannot place order right now")
        res.redirect("/index")
    }
}
module.exports = placeOrder

