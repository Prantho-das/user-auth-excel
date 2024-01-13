const Validator = require('validatorjs');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
exports.validator = async (body, rules, customMessages, callback) => {
  const validation = new Validator(body, rules, customMessages);
  validation.passes(() => callback(null, true));
  validation.fails(() => callback(validation.errors, false));
};

exports.authResponse = (token, user, token_type = "Bearer") => {
  return {
    token: token,
    token_type,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
    }
  }
}

