import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import Item from '../models/item';
import Pricing from '../models/pricing';
import { createItemValidation } from '../validations/joiValidations';
import logger from '../common/logger';
import { getMessage } from '../common/utils';
import { statusCodes } from '../common/statusCodes';
import moment from 'moment';
import Menu from '../models/menu';
import MenuItem from '../models/menuItem';
import MenuConfiguration from '../models/menuConfiguration';
import Canteen from '../models/canteen'; // Import the Canteen model

export const createMenuWithItems = async (req: Request, res: Response): Promise<Response> => {
  const { menuConfigurationId, description, items, canteenId } = req.body; // Include canteenId in the request body
  const userId = req.user?.id; // Assuming `req.user` contains the authenticated user's details

  if (!menuConfigurationId || !items || !Array.isArray(items) || !canteenId) {
    logger.error('Validation error: menuConfigurationId, items, and canteenId are required');
    return res.status(statusCodes.BAD_REQUEST).json({
      message: getMessage('validation.validationError'),
    });
  }

  const transaction: Transaction = await sequelize.transaction();

  try {
    // Check if the canteen exists
    const canteen = await Canteen.findByPk(canteenId);
    if (!canteen) {
      logger.warn(`Canteen with ID ${canteenId} not found`);
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('canteen.notFound'),
      });
    }

    // Fetch the menu configuration
    const menuConfiguration = await MenuConfiguration.findByPk(menuConfigurationId);
    if (!menuConfiguration) {
      logger.warn(`Menu configuration with ID ${menuConfigurationId} not found`);
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('menuConfiguration.notFound'),
      });
    }

    // Create a new menu using the configuration
    const menu = await Menu.create(
      {
        name: menuConfiguration.name, // Use the name from the configuration
        description,
        menuConfigurationId, // Reference the configuration
        canteenId, // Reference the canteen
        startTime: menuConfiguration.defaultStartTime, // Use the default start time from the configuration
        endTime: menuConfiguration.defaultEndTime, // Use the default end time from the configuration
        status: 'active',
        createdById: userId,
        updatedById: userId,
      },
      { transaction }
    );

    // Add items to the menu
    for (const item of items) {
      const { itemId, minQuantity, maxQuantity } = item;

      const existingItem = await Item.findByPk(itemId, { transaction });
      if (!existingItem) {
        logger.warn(`Item with ID ${itemId} not found`);
        return res.status(statusCodes.NOT_FOUND).json({
          message: getMessage('item.itemNotFound'),
        });
      }

      await MenuItem.create(
        {
          menuId: menu.id,
          itemId,
          minQuantity,
          maxQuantity,
          status: 'active',
          createdById: userId,
          updatedById: userId,
        },
        { transaction }
      );
    }

    await transaction.commit();

    logger.info(`Menu created successfully with items`);
    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('success.menuCreatedWithItems'),
      data: menu,
    });
  } catch (error: unknown) {
    await transaction.rollback();

    if (error instanceof Error) {
      logger.error(`Error creating menu with items: ${error.message}`);
    } else {
      logger.error(`Unknown error creating menu with items: ${error}`);
    }

    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

export const getAllMenus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { canteenId } = req.query; // Get canteenId from query parameters

    const whereClause: any = {};
    if (canteenId) {
      whereClause.canteenId = canteenId; // Filter by canteenId if provided
    }

    const menus = await Menu.findAll({
      where: whereClause, // Apply the filter
      include: [
        {
          model: Canteen,
          as: 'canteen', // Include canteen details
        },
        {
          model: MenuConfiguration,
          as: 'menuConfiguration', // Include menu configuration details
        },
        {
          model: MenuItem,
          as: 'menuItems', // Include menu items
          include: [
            {
              model: Item,
              as: 'item', // Include item details
            },
          ],
        },
      ],
    });

    // Convert images to base64 format
    const menusWithBase64Images = menus.map((menu) => {
      const menuData = menu.toJSON();
      menuData.menuItems = menuData.menuItems.map((menuItem: any) => {
        if (menuItem.item && menuItem.item.image) {
          // Convert image to base64
          menuItem.item.image = Buffer.from(menuItem.item.image).toString('base64');
        }
        return menuItem;
      });
      return menuData;
    });

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('success.menusFetched'),
      data: menusWithBase64Images,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching menus: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};


