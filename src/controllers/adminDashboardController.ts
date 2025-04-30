import { Request, Response } from 'express';
import logger from '../common/logger';
import { getMessage } from '../common/utils';
import { statusCodes } from '../common/statusCodes';
import { sequelize } from '../config/database'; // Import sequelize for transaction management
import { responseHandler } from '../common/responseHandler';
import Order from '../models/order';
import Item from '../models/item';
import Canteen from '../models/canteen';
import Menu from '../models/menu';

export const adminDashboard = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Fetch total orders count and total amount
    const ordersSummary = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'], // Count total orders
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount'], // Sum total amount
      ],
      where: { status: 'placed' }, // Filter by status 'placed'
    });

    const totalOrders = ordersSummary[0]?.toJSON()?.totalOrders || 0;
    const totalAmount = ordersSummary[0]?.toJSON()?.totalAmount || 0;

    // Fetch total items count

    // Fetch total canteens count
   const totalCanteens = await Canteen.count();

    // Fetch total menus count
   const totalMenus = await Menu.count(); 

     const totalItems = await Item.count();


    // Combine all data into a single response
    const dashboardSummary = {
      totalOrders,
      totalAmount,
      totalItems,
     totalCanteens,
      totalMenus,
    };

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('admin.dashboardFetched'),
      data: dashboardSummary,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching admin dashboard data: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};