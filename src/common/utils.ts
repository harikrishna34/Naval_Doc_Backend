import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import { messages } from './messages';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generates a 6-digit OTP.
 * @returns The generated OTP as a string.
 */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

export const generateToken = (payload: object, expiresIn: string = '1h'): string => {
  const secret = process.env.JWT_SECRET || 'default_secret_for_dev';
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not defined. Using fallback secret for development.');
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Get the expiry time in Unix timestamp for a given duration in seconds.
 * @param durationInSeconds - The duration in seconds to add to the current time.
 * @returns The expiry time as a Unix timestamp in the Kolkata timezone.
 */
export const getExpiryTimeInKolkata = (durationInSeconds: number): number => {
  return moment.tz('Asia/Kolkata').add(durationInSeconds, 'seconds').unix();
};

/**
 * Get a message in the configured language.
 * @param key - The key of the message (e.g., "validation.mobileRequired").
 * @returns The message in the configured language.
 */
export const getMessage = (key: string): string => {
  const language = process.env.LANGUAGE || 'EN'; // Default to English
  const keys = key.split('.');
  let message: any = messages[language as keyof typeof messages];

  for (const k of keys) {
    if (message[k]) {
      message = message[k];
    } else {
      return 'Message not found';
    }
  }

  return message;
};