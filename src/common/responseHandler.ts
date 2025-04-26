import { messages } from './messages';
import { statusCodes } from './statusCodes';
import dotenv from 'dotenv';

dotenv.config();

// Get the configured language from the environment variable
const language = (process.env.LANGUAGE || 'EN') as keyof typeof messages; // Default to English

export const responseHandler = {
  validation: {
    mobileRequired: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].validation.mobileRequired,
    },
    otpRequired: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].validation.otpRequired,
    },
    invalidOtp: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].validation.otpInvalid,
    },
    otpExpired: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].validation.otpExpired,
    },
    canteenCodeExists: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].canteen.canteenCodeExists || 'Canteen with this code already exists',
    },
    validationError: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].error.validationError || 'Validation error occurred',
    },
  },
  success: {
    otpSent: {
      status: statusCodes.SUCCESS,
      message: messages[language].success.otpSent,
    },
    otpVerified: {
      status: statusCodes.SUCCESS,
      message: messages[language].success.otpVerified,
    },
    otpResent: {
      status: statusCodes.SUCCESS,
      message: messages[language].success.otpResent,
    },
    roleCreated: {
      status: statusCodes.SUCCESS,
      message: messages[language].success.roleCreated || 'Role created successfully',
    },
    rolesFetched: {
      status: statusCodes.SUCCESS,
      message: messages[language].success.rolesFetched || 'Roles fetched successfully',
    },
    canteenCreated: {
      status: statusCodes.SUCCESS,
      message: messages[language].success.canteenCreated || 'Canteen and admin user created successfully',
    },
  },
  error: {
    internalServerError: {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: messages[language].error.internalServerError || 'Internal server error occurred',
    },
    validationError: {
      status: statusCodes.BAD_REQUEST,
      message: messages[language].error.validationError || 'Validation error occurred',
    },
  },
};