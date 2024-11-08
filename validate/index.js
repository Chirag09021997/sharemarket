const Joi = require("joi");

const registerValidate = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  password_confirmation: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .label("Password Confirmation")
    .messages({ "any.only": "{{#label}} does not match" }),
});

const loginValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const marketValidate = Joi.object({
  image_url: Joi.string().optional().allow(""),
  image: Joi.string().optional().allow(""),
  symbol: Joi.string().required(),
  country: Joi.string().required(),
  industry: Joi.string().optional().allow(""),
  type: Joi.string().required().valid('stock', 'indics', 'commodities', 'currencies', 'cryptocurrency', 'futures', 'etfs', 'funds', 'bonds'),
  subtype: Joi.string().optional().allow(""),
});

module.exports = {
  registerValidate,
  loginValidate,
  marketValidate,
};
