import Joi from 'joi';

// Validation for login with mobile
export const loginWithMobileValidation = Joi.object({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be a 10-digit number',
      'any.required': 'Mobile number is required',
    }),
});

// Validation for verifying OTP
export const verifyOtpValidation = Joi.object({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be a 10-digit number',
      'any.required': 'Mobile number is required',
    }),
  otp: Joi.string()
    .length(6)
    .required()
    .messages({
      'string.length': 'OTP must be a 6-digit number',
      'any.required': 'OTP is required',
    }),
});

// Validation for resending OTP
export const resendOtpValidation = Joi.object({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be a 10-digit number',
      'any.required': 'Mobile number is required',
    }),
});