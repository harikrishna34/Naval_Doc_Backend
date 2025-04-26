import Joi from 'joi';
import { messages } from '../common/messages';
import dotenv from 'dotenv';

dotenv.config();

// Get the configured language from the environment variable
const language = (process.env.LANGUAGE || 'EN') as keyof typeof messages;

// Validation for login with mobile
export const loginWithMobileValidation = Joi.object({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': messages[language].validation.mobileInvalid,
      'any.required': messages[language].validation.mobileRequired,
    }),
});

// Validation for verifying OTP
export const verifyOtpValidation = Joi.object({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': messages[language].validation.mobileInvalid,
      'any.required': messages[language].validation.mobileRequired,
    }),
  otp: Joi.string()
    .length(6)
    .required()
    .messages({
      'string.length': messages[language].validation.otpInvalid,
      'any.required': messages[language].validation.otpRequired,
    }),
});

// Validation for resending OTP
export const resendOtpValidation = Joi.object({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': messages[language].validation.mobileInvalid,
      'any.required': messages[language].validation.mobileRequired,
    }),
});

// Validation for creating a canteen
export const createCanteenValidation = Joi.object({
  canteenName: Joi.string().required().messages({
    'string.empty': messages[language].canteen.nameRequired,
  }),
  canteenCode: Joi.string().required().messages({
    'string.empty': messages[language].canteen.codeRequired,
  }),

  adminFirstName: Joi.string().required().messages({
    'string.empty': messages[language].admin.firstNameRequired,
  }),
  adminLastName: Joi.string().required().messages({
    'string.empty': messages[language].admin.lastNameRequired,
  }),
  adminEmail: Joi.string().email().required().messages({
    'string.empty': messages[language].admin.emailRequired,
    'string.email': messages[language].admin.emailInvalid,
  }),
  adminMobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': messages[language].admin.mobileRequired,
      'string.pattern.base': messages[language].admin.mobileInvalid,
    }),
});