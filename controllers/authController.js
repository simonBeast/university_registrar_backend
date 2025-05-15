const user = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const AppExceptions = require("../utils/AppExceptions");
const sendMail = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const userModel = require("../models/letterModel");

exports.login = catchAsync(async (req, res, next) => {

  let foundUser = user.findOne({ username: req.body.username, isActive: true });
 
  let foundUserAll = await user.findOne({ username: req.body.username, isActive: true });

  if (!foundUserAll) {
    return next(new AppExceptions("Username or password incorrect", 401));
  }

  let foundUserWOP = await foundUser.select("-createdAt -__v");

  let foundUserWP = await user
    .findOne({ username: req.body.username })
    .select("+password");

  
  if (await bcrypt.compare(req.body.password, foundUserWP.password)) {
    this.createAndSendTokenAndUser(foundUserWOP, 200, res);
  } else {
    return next(new AppExceptions("Email or password incorrect", 401));
  }
});

exports.signUp = async (req, res, next) => {
  try {
    
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    
    if(req?.file){

      req.body.profilePhoto = req.file.filename;

    }

    req.body.verificationToken = verificationToken;

    req.body.verificationTokenExpires = verificationTokenExpires;

    req.body.isActive = false; 

    const newUser = await user.create(req.body);


    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verify/${verificationToken}`;

    const message = `Email verification step for registeration ---> 
        please click on the below link if you are registering if you arenot please ignore this `;
    const options = {
      email: req.body.email,
      subject: "Your registeration token that is only valid for 24Hrs",
      message: message + " \n " + resetUrl,

    };
    await sendMail(options);
   

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (err) {
    console.log(err);
    return next(new AppExceptions(err, 401));
  }
};

exports.getCurrentUser = async (req, res, next) => {

  const foundUser = await user.findById(req?.user?.id);
  
  if(!foundUser){
    
    return null;

  }

  return res.status(200).json(
    {...foundUser.toObject()}
  );
}

exports.verifyEmail = async (req, res, next) => {
  try {
    const foundUser = await user.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }, 
    });

    if (!foundUser) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    foundUser.isActive = true;
    foundUser.verificationToken = undefined;
    foundUser.verificationTokenExpires = undefined;
    await foundUser.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    return next(new AppExceptions(err, 500));
  }
};



exports.jwtSign = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

exports.createAndSendToken = (user, statusCode, res) => {
  const token = this.jwtSign({ id: user._id });
  res.status(statusCode).json({
    status: "success",
    token,
  });
};
exports.createAndSendTokenAndUser = (user, statusCode, res) => {
  const token = this.jwtSign({ id: user._id });
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.forgotPassword = async (req, res, next) => {
  const foundUser = await user.findOne({ email: req.body.email });
  if (!foundUser) {
    return next(new AppExceptions("Email not found", 404));
  }
  const randToken = foundUser.createPasswordResetToken();
  try {
    await foundUser.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${randToken}`;
    const message = `Email verification step for resetting Password ---> 
        please copy the text below if you forgot your password if you didn't please ignore this `;
    const options = {
      email: foundUser.email,
      subject: "Your password reset Token that is only valid for 10min",
      message: message + " \n " + randToken
    };
    await sendMail(options);
    res.status(200).json({
      status: "Success",
      message: "Token Sent to email",
    });
  } catch (e) {
    foundUser.passwordResetToken = undefined;
    foundUser.passwordResetExpires = undefined;
    await foundUser.save({ validateBeforeSave: false });
    console.log(e);
    return next(new AppExceptions(e, 500));
  }
};
exports.verifyResetToken = catchAsync(async (req, res, next) => {

  let token = req.body.resetToken;

  token = crypto.createHash("sha256").update(token).digest("hex");

  const foundUser = await user.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!foundUser) {
    return next(
      new AppExceptions("invalid reset Token or the token has expired", 404)
    );
  }

  return res.status(200).json(
   {...foundUser.toObject()}
  );
  }

)

exports.resetPassword = catchAsync(async (req, res, next) => {
 let userId = req.body.userId;

 const foundUser = await user.findById(userId);

  if(req.body.password !== req.body.passwordConfirm){
    return next(new AppExceptions("Password and Password Confirm have to be the same", 404));
  }
  if (!foundUser) {
    return next(
      new AppExceptions("invalid reset Token or the token has expired", 404)
    );
  }
  foundUser.password = req.body.password;
  foundUser.passwordConfirm = req.body.passwordConfirm;
  foundUser.passwordResetExpires = undefined;
  foundUser.passwordResetToken = undefined;
  await foundUser.save();
  return this.createAndSendTokenAndUser(foundUser, 200, res);
});

exports.verification = catchAsync(async (req, res, next) => {
 const { userId } = req.params;
 const foundUser = await user.findById(userId);
 
 if(!foundUser){
  return next(new AppExceptions("User was not found", 404));
 }

 foundUser.isAdminVerified = !foundUser.isAdminVerified;

 const savedUser = await foundUser.save();

 return res.status(200).json(
  savedUser.toObject()
 )

});

exports.activation = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
 const foundUser = await user.findById(userId);
 
 if(!foundUser){

  return next(new AppExceptions("User was not found", 404));

 }

 foundUser.isActive = !foundUser.isActive;

 const savedUser = await foundUser.save();

 return res.status(200).json(

  savedUser.toObject()

 )
});
