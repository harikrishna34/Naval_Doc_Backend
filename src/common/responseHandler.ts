import { messages } from './messages';
import { statusCodes } from './statusCodes';
import dotenv from 'dotenv';

dotenv.config();

// Get the configured language from the environment variable
const language = (process.env.LANGUAGE || 'EN') as keyof typeof messages; // Default to English

export const responseHandler = {
  validation: {
    mobileRequired: { status: statusCodes.BAD_REQUEST, message: messages[language].validation.mobileRequired },
    otpRequired: { status: statusCodes.BAD_REQUEST, message: messages[language].validation.otpRequired },
    invalidOtp: { status: statusCodes.BAD_REQUEST, message: messages[language].validation.invalidOtp },
  },
  success: {
    otpSent: { status: statusCodes.SUCCESS, message: messages[language].success.otpSent },
    otpVerified: { status: statusCodes.SUCCESS, message: messages[language].success.otpVerified },
    otpResent: { status: statusCodes.SUCCESS, message: messages[language].success.otpResent },
  },
  error: {
    internalServerError: { status: statusCodes.INTERNAL_SERVER_ERROR, message: messages[language].error.internalServerError },
  },
};