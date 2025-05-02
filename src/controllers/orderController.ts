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
import Canteen from '../models/canteen';
import Item from '../models/item';
import axios from 'axios';
dotenv.config();




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


export const listOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.user as { userId: string }; // Extract userId from the request

    if (!userId) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['userId is required'],
      });
    }

    // Fetch all orders for the user
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems', // Ensure this matches the alias in the Order -> OrderItem association
          include: [
            {
              model: Item,
              as: 'menuItemItem', // Ensure this matches the alias in the OrderItem -> Item association
              attributes: ['id', 'name', 'description', 'image'], // Fetch necessary item fields
            },
          ],
        },
        {
          model: Payment,
          as: 'payment', // Ensure this matches the alias in the Order -> Payment association
          attributes: ['id', 'amount', 'status', 'paymentMethod'], // Fetch necessary payment fields
        },
      ],
      order: [['createdAt', 'DESC']], // Sort by most recent orders
    });

    if (!orders || orders.length === 0) {
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('order.noOrdersFound'),
      });
    }

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('order.listFetched'),
      data: orders,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching orders: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};


export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.query as { id: string }; // Extract userId from the request
    if (!id) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['Order ID is required'],
      });
    }

    // Fetch the order by ID
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems', // Ensure this matches the alias in the Order -> OrderItem association
          include: [
            {
              model: Item,
              as: 'menuItemItem', // Ensure this matches the alias in the OrderItem -> Item association
              attributes: ['id', 'name', 'description', 'image'], // Fetch necessary item fields
            },
          ],
        },
        {
          model: Payment,
          as: 'payment', // Ensure this matches the alias in the Order -> Payment association
          attributes: ['id', 'amount', 'status', 'paymentMethod'], // Fetch necessary payment fields
        },
        {
          model: Canteen,
          as: 'orderCanteen', // Ensure this matches the alias in the Order -> Canteen association
          attributes: ['id', 'canteenName'], // Fetch necessary canteen fields
        },
      ],
    });

    if (!order) {
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('order.notFound'),
      });
    }

    // Convert item images to Base64
    const orderData = order.toJSON();
    orderData.orderItems = orderData.orderItems.map((orderItem: any) => {
      if (orderItem.menuItemItem && orderItem.menuItemItem.image) {
        orderItem.menuItemItem.image = Buffer.from(orderItem.menuItemItem.image).toString('base64');
      }
      return orderItem;
    });

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('order.fetched'),
      data: orderData,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching order by ID: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};
export const getAllOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Fetch all orders
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
        },
        {
          model: Payment,
          as: 'payment',
        },
      ],
      order: [['createdAt', 'DESC']], // Sort by most recent orders
    });

    if (!orders || orders.length === 0) {
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('order.noOrdersFound'),
      });
    }

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('order.allOrdersFetched'),
      data: orders,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching all orders: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

export const getOrdersSummary = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Fetch total orders count and total amount

    const result = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'], // Count total orders
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount'], // Sum total amount
      ],
      where: { status: 'placed' }, // Filter by status 'placed'
    });

    const summary = result[0]?.toJSON();

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('order.summaryFetched'),
      data: summary,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching orders summary: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

export const getOrdersByCanteen = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Fetch total orders and total amount grouped by canteen name
    const result = await Order.findAll({
      attributes: [
        [sequelize.col('Canteen.canteenName'), 'canteenName'], // Use the correct column name
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'totalOrders'], // Count total orders
        [sequelize.fn('SUM', sequelize.col('Order.totalAmount')), 'totalAmount'], // Sum total amount
      ],
      include: [
        {
          model: Canteen, // Ensure the model is correctly imported
          as: 'Canteen', // Alias must match the association
          attributes: [], // Exclude additional Canteen attributes
        },
      ],
      group: ['Canteen.canteenName'], // Group by the correct column name
      where: { status: 'placed' }, // Filter by status 'placed'
    });

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('order.canteenSummaryFetched'),
      data: result,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching orders by canteen: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};


export const processCashfreePayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { orderId, amount, currency = 'INR', customerName, customerEmail, customerPhone } = req.body;

    // Validate required fields
    if (!orderId || !amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['orderId, amount, customerName, customerEmail, and customerPhone are required'],
      });
    }

    // Cashfree API credentials (ensure these are stored securely in environment variables)
    const CASHFREE_APP_ID = process.env.pgAppID;
    const CASHFREE_SECRET_KEY = process.env.pgSecreteKey;
    const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg'; // Use sandbox for testing

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Cashfree credentials are not configured',
      });
    }

    // Create order payload for Cashfree
    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: "3", // Add customer_id using the userId from the request
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
       // payment_methods: ['upi'], // Restrict to UPI only
        return_url: `${process.env.BASE_URL}/api/order/cashfreecallback?order_id={order_id}`,
      },
    };

    // Make API request to Cashfree to create an order
    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2025-01-01',
      },
    });

    // Handle Cashfree response
    if (response.status === 200 && response.data) {
      return res.status(statusCodes.SUCCESS).json({
        message: 'Cashfree order created successfully',
        data: response.data,
      });
    } else {
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to create Cashfree order',
        data: response.data,
      });
    }
  } catch (error: unknown) {
    console.log(error)
    logger.error(`Error processing Cashfree payment: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

export const cashfreeCallback = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { order_id, payment_status, payment_amount, payment_currency, transaction_id } = req.body;

    // Validate required fields
    if (!order_id || !payment_status) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['order_id and payment_status are required'],
      });
    }

    // Fetch the order by ID
    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) {
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('order.notFound'),
      });
    }

    // Update the order status based on payment status
    if (payment_status === 'SUCCESS') {
      order.status = 'completed';
    } else if (payment_status === 'FAILED') {
      order.status = 'failed';
    } else {
      order.status = 'pending';
    }

    // Save the updated order
    await order.save();

    // Check if a payment record already exists for the order
    const existingPayment = await Payment.findOne({ where: { orderId: order.id } });

    if (existingPayment) {
      // Update the existing payment record
      existingPayment.paymentMethod = 'Cashfree';
      existingPayment.transactionId = transaction_id || existingPayment.transactionId;
      existingPayment.amount = payment_amount;
      existingPayment.currency = payment_currency;
      existingPayment.status = payment_status.toLowerCase();
      await existingPayment.save();
    } else {
      // Create a new payment record
      await Payment.create({
        orderId: order.id,
        userId: order.userId,
        paymentMethod: 'Cashfree',
        transactionId: transaction_id || null,
        amount: payment_amount,
        currency: payment_currency,
        status: payment_status.toLowerCase(),
      });
    }

    return res.status(statusCodes.SUCCESS).json({
      message: 'Payment status updated successfully',
      data: {
        orderId: order.id,
        status: order.status,
        paymentStatus: payment_status,
      },
    });
  } catch (error: unknown) {
    logger.error(`Error handling Cashfree callback: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};