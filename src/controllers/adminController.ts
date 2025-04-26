import { Request, Response } from 'express';
import Role from '../models/role';
import UserRole from '../models/userRole';
import logger from '../common/logger';
import { getMessage } from '../common/utils';
import { statusCodes } from '../common/statusCodes';

export const createRole = async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.body;

  // Validate the request body
  if (!name) {
    logger.error('Validation error: Role name is required');
    return res.status(statusCodes.BAD_REQUEST).json({
      message: getMessage('validation.roleNameRequired'),
    });
  }

  try {
    // Create the role
    const role = await Role.create({ name });

    logger.info(`Role created successfully: ${name}`);
    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('success.roleCreated'),
      data: role,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error creating role: ${error.message}`);
    } else {
      logger.error(`Unknown error creating role: ${error}`);
    }

    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

export const assignRole = async (req: Request, res: Response): Promise<Response> => {
  const { userId, roleId } = req.body;

  // Validate the request body
  if (!userId || !roleId) {
    logger.error('Validation error: userId and roleId are required');
    return res.status(statusCodes.BAD_REQUEST).json({
      message: getMessage('validation.userIdRoleIdRequired'),
    });
  }

  try {
    // Assign the role to the user
    const userRole = await UserRole.create({ userId, roleId });

    logger.info(`Role assigned successfully: userId=${userId}, roleId=${roleId}`);
    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('success.roleAssigned'),
      data: userRole,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error assigning role: ${error.message}`);
    } else {
      logger.error(`Unknown error assigning role: ${error}`);
    }

    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

export const getAllRoles = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Fetch all roles
    const roles = await Role.findAll();

    logger.info('Roles fetched successfully');
    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('success.rolesFetched'),
      data: roles,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error fetching roles: ${error.message}`);
    } else {
      logger.error(`Unknown error fetching roles: ${error}`);
    }

    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};