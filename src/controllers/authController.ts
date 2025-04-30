import { Request, Response } from 'express';
import User from '../models/user';
import Otp from '../models/otp';
import Role from '../models/role'; // Import the Role model
import UserRole from '../models/userRole'; // Import the UserRole model
import { generateOtp, generateToken, getExpiryTimeInKolkata, getMessage,sendOTPSMS } from '../common/utils';
import {
  loginWithMobileValidation,
  verifyOtpValidation,
  resendOtpValidation,
} from '../validations/joiValidations';
import { sequelize } from '../config/database'; // Import sequelize for transaction management
import { responseHandler } from '../common/responseHandler';
import { statusCodes } from '../common/statusCodes';
import logger from '../common/logger';

export const loginWithMobile = async (req: Request, res: Response) => {
  const { mobile } = req.body;

  // Validate the request body
  const { error } = loginWithMobileValidation.validate({ mobile });
  if (error) {
    logger.error(`Validation error: ${error.details[0].message}`);
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ message: getMessage('validation.mobileRequired') });
  }

  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // Check if the user exists
    let user = await User.findOne({ where: { mobile }, transaction });
    if (!user) {
      // Create a new user if not found
      user = await User.create({ mobile }, { transaction });
      logger.info(`New user created with mobile: ${mobile}`);

      // Assign the default "User" role to the new user
      const userRole = await Role.findOne({ where: { name: 'User' }, transaction });
      if (userRole) {
        await UserRole.create({ userId: user.id, roleId: userRole.id }, { transaction });
        logger.info(`Default role "User" assigned to user with mobile: ${mobile}`);
      } else {
        logger.warn('Default role "User" not found in the database');
      }
    }

    // Generate OTP and expiry time
    const otp = generateOtp();
    const expiresAt = getExpiryTimeInKolkata(60); // OTP expires in 60 seconds

    // Save OTP to the database
    await Otp.create({ mobile, otp, expiresAt }, { transaction });

    await transaction.commit(); // Commit the transaction

    sendOTPSMS(mobile,otp)

    logger.info(`OTP generated for mobile ${mobile}: ${otp}`);
    res
      .status(statusCodes.SUCCESS)
      .json({ message: getMessage('success.otpSent') });
  } catch (error: unknown) {
    await transaction.rollback(); // Rollback the transaction in case of an error

    if (error instanceof Error) {
      logger.error(`Error in loginWithMobile: ${error.message}`);
    } else {
      logger.error(`Unknown error in loginWithMobile: ${error}`);
    }

    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: getMessage('error.internalServerError') });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  const { error } = verifyOtpValidation.validate({ mobile, otp });

  if (error) {
    logger.error(`Validation error: ${error.details[0].message}`);
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }

  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // Find the OTP record
    const otpRecord = await Otp.findOne({ where: { mobile, otp }, transaction });

    if (!otpRecord) {
      logger.warn(`Invalid OTP for mobile ${mobile}`);
      await transaction.rollback(); // Rollback the transaction
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({ message: responseHandler.validation.invalidOtp.message });
    }

    // Check if the OTP has expired
    const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    if (currentTime > otpRecord.expiresAt) {
      logger.warn(`Expired OTP for mobile ${mobile}`);
      await otpRecord.destroy({ transaction }); // Delete the expired OTP
      await transaction.rollback(); // Rollback the transaction
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({ message: getMessage('validation.otpExpired') });
    }

    // OTP is valid, delete the OTP record
    await otpRecord.destroy({ transaction });

    // Fetch the user associated with the mobile number
    const user = await User.findOne({ where: { mobile }, transaction });

    if (!user) {
      logger.error(`User not found for mobile ${mobile}`);
      await transaction.rollback();
      return res
        .status(statusCodes.NOT_FOUND)
        .json({ message: getMessage('user.notFound') });
    }

    // Generate a JWT token using the userId
    const token = generateToken({ userId: user.id });

    await transaction.commit(); // Commit the transaction

    logger.info(`OTP verified for mobile ${mobile}, token generated for userId ${user.id}`);
    res
      .status(statusCodes.SUCCESS)
      .json({ message: responseHandler.success.otpVerified.message, token });
  } catch (error: unknown) {
    await transaction.rollback(); // Rollback the transaction in case of an error

    if (error instanceof Error) {
      logger.error(`Error in verifyOtp: ${error.message}`);
    } else {
      logger.error(`Unknown error in verifyOtp: ${error}`);
    }

    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: responseHandler.error.internalServerError.message });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  const { mobile } = req.body;

  const { error } = resendOtpValidation.validate({ mobile });

  if (error) {
    logger.error(`Validation error: ${error.details[0].message}`);
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }

  try {
    const otp = generateOtp(); // Generate a new OTP
    const expiresAt = getExpiryTimeInKolkata(180); // Set expiry time to 180 seconds from now

    const otpRecord = await Otp.findOne({ where: { mobile } });
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.expiresAt = expiresAt; // Update expiry time
      await otpRecord.save();
    } else {
      await Otp.create({ mobile, otp, expiresAt });
    }

    logger.info(`Resent OTP for mobile ${mobile}: ${otp}`); // Log OTP resend
    sendOTPSMS(mobile,otp)

    res
      .status(statusCodes.SUCCESS)
      .json({ message: responseHandler.success.otpResent.message });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in resendOtp: ${error.message}`);
    } else {
      logger.error(`Unknown error in resendOtp: ${error}`);
    }
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: responseHandler.error.internalServerError.message });
  }
};