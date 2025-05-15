const Joi = require("joi");
const { objectIdValidation } = require("./objectIdValidation");

module.exports.userCreateValidationSchema = {
    body: Joi.object({
        username: Joi.string().min(6).required(),
        fullName:Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid("STAFF","ADMIN","STUDENT","ALUMNI").required(),
        isActive: Joi.boolean().optional(),
        profilePhoto: Joi.string().optional(),
    }).options({abortEarly:false})
}

module.exports.userUpdateValidationSchema = {
    body: Joi.object({
        username: Joi.string().min(6).optional(),
        fullName:Joi.string().optional(),
        email: Joi.string().email().optional(),
        isActive: Joi.boolean().optional(),
        profilePhoto: Joi.string().optional(),
    }).options({abortEarly:false})
}

module.exports.changePasswordValidationSchema = {
  body: Joi.object({
    newPassword: Joi.string().min(8).required(),
    oldPassword: Joi.string().min(8).required(),
  }).options({ abortEarly: false }),
};
module.exports.authValidationSchema = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }).options({ abortEarly: false }),
};
module.exports.forgotPasswordValidationSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }).options({ abortEarly: false }),
};
module.exports.resetPasswordValidationSchema = {
  body: Joi.object({
    password: Joi.string().required(),
    passwordConfirm: Joi.string().required(),
    userId: objectIdValidation.required()
  }).options({ abortEarly: false }),
};

module.exports.verifyResetTokenValidationSchema = {
  body: Joi.object({
    resetToken: Joi.string().required(),
  }).options({ abortEarly: false }),
};