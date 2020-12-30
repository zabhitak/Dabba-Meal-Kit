var User = require("../user/User")
const keys = require('../../keys');
const Publishable_Key = keys.Publishable_Key;

myCart =  async (req,res) => {
    
    try {
        var user = await  User.findById(req.user.id).populate('cart')
        var { totalCost }  = user
        var products = user.cart
        res.render("myCart",{ title : "My Products", user, products ,totalCost,Publishable_Key })

    } catch (error) {
        req.flash("error","Not able to fetch data from database")
        res.redirect("/index")
    }
   
} 
module.exports = myCart