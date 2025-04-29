import { sequelize } from '../config/database';
import { Request, Response } from 'express'; // Added Response import
import Cart from '../models/cart';
import CartItem from '../models/cartItem';
import Order from '../models/order';
import OrderItem from '../models/orderItem';
import Payment from '../models/payment';
import logger from '../common/logger';
import { getMessage } from '../common/utils';
import { statusCodes } from '../common/statusCodes';
import { Transaction } from 'sequelize';
import QRCode from 'qrcode'; // Import QRCode library
import dotenv from 'dotenv';


export const placeOrder = async (req: Request, res: Response): Promise<Response> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { userId } = req.user as { userId: string };
    const { paymentMethod, transactionId, currency = 'INR' } = req.body;

    if (!userId || !paymentMethod) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['userId and paymentMethod are required'],
      });
    }

    const cart: any = await Cart.findOne({
      where: { userId, status: 'active' },
      include: [{ model: CartItem, as: 'cartItems' }],
      transaction,
    });

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.empty'),
      });
    }

    const amount = cart.totalAmount;
    const gatewayPercentage = 2.5;
    const gatewayCharges = (amount * gatewayPercentage) / 100;
    const totalAmount = amount + gatewayCharges;

    // Create the order
    const order = await Order.create(
      {
        userId,
        totalAmount: cart.totalAmount,
        status: 'placed',
        canteenId: cart.canteenId,
        menuConfigurationId: cart.menuConfigurationId,
        createdById: userId, // Set createdById to the userId from the request
      },
      { transaction }
    );

    // Generate QR Code
    const qrCodeData = `${process.env.BASE_URL}/api/order/${order.id}`; // Example: URL to fetch order details
    const qrCode = await QRCode.toDataURL(qrCodeData); // Generate QR code as a data URL

    // Update the order with the QR code
    order.qrCode = qrCode;
    await order.save({ transaction });

    // Create order items
    const orderItems = cart.cartItems.map((cartItem: any) => ({
      orderId: order.id,
      itemId: cartItem.itemId,
      quantity: cartItem.quantity,
      price: cartItem.price,
      total: cartItem.total,
      createdById: userId, // Set createdById to the userId from the request
    }));
    await OrderItem.bulkCreate(orderItems, { transaction });

    // Store payment details
    await Payment.create(
      {
        orderId: order.id,
        userId,
        paymentMethod,
        transactionId: transactionId || null,
        amount,
        gatewayPercentage,
        gatewayCharges,
        totalAmount,
        currency,
        status: 'success',
        createdById: userId, // Set createdById to the userId from the request
        updatedById: userId, // Set createdById to the userId from the request

    },
      { transaction }
    );

    // Clear the cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });
    await cart.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('order.placed'),
      data: {
        order,
        payment: {
          paymentMethod,
          transactionId,
          amount,
          gatewayPercentage,
          gatewayCharges,
          totalAmount,
          currency,
        },
        qrCode, // Include the QR code in the response
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error(`Error placing order: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};