const Joi = require('joi');
const mongoose = require('mongoose');
module.exports.objectIdValidation = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {

    return helpers.error('any.custom', { message: 'Invalid MongoDB ObjectId provided.' });
  }
  return value;
}, 'ObjectId Validation');
