var mongoose = require("mongoose")

var otpSchema = new mongoose.Schema({
    timeOfSending : Date,
    otp : String,
    user : { 
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    username : {
        type : String,
    },
    email : {
        type : String,
    },
    password : {
        type : String,
    },
    role : {
        type : String,
        default : "User"
    },
})

module.exports = mongoose.model("OTP",otpSchema)