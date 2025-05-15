const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { ROLE_TYPE } = require('../utils/utils');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Please enter your username"],
        unique:true
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true
    },
    fullName:{
        type:String,
        required:[true,"Please enter your full name"],
    },
    password:{
        type:String,
        required:[true,"please fill the password field"],
        select:false
    },
    role:{
        type:String,
        required:[true,"please fill the role field"],
    },
    profilePhoto:{
        type: String,
        default: "default.png", 
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    isAdminVerified:{
        type:Boolean,
        default:false,
    },
    passwordChangedAt:{
        type:Date
    },

    verificationToken:String,

    verificationTokenExpires:Date,

    passwordResetToken:String,

    passwordResetExpires:Date
    
},{timestamps:true})
userSchema.pre('save',async function (next){
   if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,await bcrypt.genSalt());
    next();
});
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew)
    {return next();}
    this.passwordChangedAt = Date.now() - 1000;
    next();
})
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    let changedTimeStamp;
    if(this.passwordChangedAt){
        changedTimeStamp = parseInt(this.passwordChangedAt.getTime(),10) / 1000;
    }
    return changedTimeStamp > JWTTimeStamp;
}
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
} 

userSchema.index({ sender: 1 });
userSchema.index({ receiver: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isRead: 1 });
module.exports = mongoose.model("User",userSchema);