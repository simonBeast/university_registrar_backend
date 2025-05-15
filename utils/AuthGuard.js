const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const appExceptions = require("./AppExceptions");
const user = require("../models/userModel");
exports.guard = async function(req,res,next){
    let token;
    let verified;
    let bearerToken = req.headers.authorization;
    if(bearerToken && bearerToken.startsWith("Bearer")){
        token = bearerToken.split(" ")[1];
        try{
            verified = await promisify(jwt.verify)(token,process.env.JWT_SECRET_KEY);
        }
        catch(e){
            return next(new appExceptions("Unauthorized",401));
        }
        if(verified){
            const decodedPayload = jwt.decode(token);
            const foundUser = await user.findById(decodedPayload.id).select('-__v -createdAt')
            if(foundUser){
                //check if the user has changed his/her password after the token was issued
               if(foundUser.changedPasswordAfter(decodedPayload.iat)){
                return next(new appExceptions("User recently changed his password please login again",401));
               }
                req.user = foundUser;
                return next();
            }
        }
    }
    
        return next(new appExceptions("Not Authorized",401));
   
}
exports.restrictTo = (...roles)=>{
  return (req,res,next)=>{
     
        if(!roles.includes(req.user.role)){
            return next(new appExceptions("Forbidden resource",403))
            }
    next();
    }
}