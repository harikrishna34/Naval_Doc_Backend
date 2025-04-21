import { Request, Response } from 'express';
import Role from '../models/role';
import UserRole from '../models/userRole';
import logger from '../common/logger';
import { responseHandler } from '../common/responseHandler';
import { statusCodes } from '../common/statusCodes';

export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    logger.error('Validation error: Role name is required');
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ message: responseHandler.error.validationError.message });
  }

  try {
    const role = await Role.create({ name });

    logger.info(`Role created successfully: ${name}`);
    res
      .status(statusCodes.SUCCESS)
      .json({ message: responseHandler.success.roleCreated.message, role });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error creating role: ${error.message}`);
    } else {
      logger.error(`Unknown error creating role: ${error}`);
    }

    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: responseHandler.error.internalServerError.message });
  }
};

export const assignRole = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    const userRole = await UserRole.create({ userId, roleId });
    res.status(201).json({ message: 'Role assigned successfully', userRole });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning role', error });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll();

    logger.info('Roles fetched successfully');
    res
      .status(statusCodes.SUCCESS)
      .json({ message: responseHandler.success.rolesFetched.message, roles });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error fetching roles: ${error.message}`);
    } else {
      logger.error(`Unknown error fetching roles: ${error}`);
    }

    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: responseHandler.error.internalServerError.message });
  }
};