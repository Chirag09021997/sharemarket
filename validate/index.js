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
  type: Joi.string()
    .required()
    .valid(
      "stock",
      "indics",
      "commodities",
      "currencies",
      "cryptocurrency",
      "futures",
      "etfs",
      "funds",
      "bonds"
    ),
  subtype: Joi.string().optional().allow(""),
  name: Joi.string().optional().allow(""),
  market_type: Joi.string().required().valid("US", "EU", "ASIA", "AU", "None"),
  regular_market_price: Joi.number().optional().allow(0).min(0),
  previous_close: Joi.number().optional().allow(0).min(0),
  regular_market_day_high: Joi.number().optional().allow(0).min(0),
  regular_market_day_low: Joi.number().optional().allow(0).min(0),
});

const categoryValidate = Joi.object({
  name: Joi.string().required(),
});

const userTrackingValidate = Joi.object({
  device_id: Joi.string().required(),
  promotion_type: Joi.string().optional().valid("organic", "paid", "none"),
  country_name: Joi.string().optional(),
  state_name: Joi.string().optional(),
  city_name: Joi.string().optional(),
});

module.exports = {
  registerValidate,
  loginValidate,
  marketValidate,
  categoryValidate,
  userTrackingValidate,
};
