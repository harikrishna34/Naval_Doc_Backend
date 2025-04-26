import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getMessage } from '../common/utils';
import { statusCodes } from '../common/statusCodes';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(statusCodes.UNAUTHORIZED).json({
      message: getMessage('error.tokenRequired'),
    });
  }

  try {

    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    // Check if the token has expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        message: getMessage('error.tokenExpired'),
      });
    }

    // Attach the decoded token to the request object for further use
    req.user = decoded as JwtPayload;

    next(); // Token is valid, proceed to the next middleware or controller
  } catch (error) {
    return res.status(statusCodes.UNAUTHORIZED).json({
      message: getMessage('error.invalidToken'),
    });
  }
};

export default authenticateToken;