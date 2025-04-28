import { Request, Response } from 'express';
import Pricing from '../models/pricing';
import Item from '../models/item';

import CartItem from '../models/cartItem';
import Cart from '../models/cart';
import MenuConfiguration from '../models/menuConfiguration';
import Canteen from '../models/canteen';

import logger from '../common/logger';
import { statusCodes } from '../common/statusCodes';
import { getMessage } from '../common/utils';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * Add an item to the user's cart with transaction support
 * Updated to include canteenId and menuConfigurationId
 */
export const addToCart = async (req: Request, res: Response): Promise<Response> => {
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED });

  try {

    const { userId } = req.user as { userId: string }; // Extract userId from the request body

    const {  itemId, quantity, menuId, canteenId, menuConfigurationId } = req.body;

    // Validate required fields
    if (!userId || !itemId || !quantity || !menuId || !canteenId || !menuConfigurationId) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['userId, itemId, quantity, menuId, canteenId, and menuConfigurationId are required'],
      });
    }

    if (quantity <= 0) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['Quantity must be greater than 0'],
      });
    }

    // Verify the item exists and get its pricing
    console.log('Fetching item with ID:', itemId);
    const item = await Item.findByPk(itemId, {
      include: [{ model: Pricing, as: 'pricing' }],
      transaction,
    });
    console.log('Fetched item:', item);

    if (!item) {
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('item.notFound'),
      });
    }

    // Get or create the user's cart
    console.log('Finding or creating cart for userId:', userId);
    let [cart, created] = await Cart.findOrCreate({
      where: { userId, status: 'active' },
      defaults: {
        userId,
        status: 'active',
        totalAmount: 0,
        canteenId,
        menuConfigurationId,
        menuId,
      },
      transaction,
    });
    console.log('Cart:', cart, 'Created:', created);

    if (!created && cart.canteenId !== canteenId) {
      await transaction.rollback();
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('cart.canteenMismatch'),
        errors: ['Items from different canteens cannot be added to the same cart'],
      });
    }

    // Calculate item price
    const price = item.pricing ? item.pricing.price : 0;
    const itemTotal = price * quantity;

    // Check if the item already exists in the cart
    console.log('Checking for existing cart item with itemId:', itemId);
    const existingCartItem = await CartItem.findOne({
      where: { cartId: cart.id, itemId, menuId, },
      transaction,
    });
    console.log('Existing Cart Item:', existingCartItem);

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      existingCartItem.total = existingCartItem.quantity * price;
      await existingCartItem.save({ transaction });
    } else {
      await CartItem.create(
        {
          cartId: cart.id,
          itemId,
          menuId,
          quantity,
          price,
          total: itemTotal,
          canteenId,
        },
        { transaction }
      );
    }

    // Update cart total
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id }, transaction });
    if (cart) {
      if (cart) {
        cart.totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
        await cart.save({ transaction });
      }
    }

    // Commit transaction
    await transaction.commit();

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('cart.itemAdded'),
      data: cart,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error(`Error adding item to cart: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

/**
 * Update cart item quantity with transaction support
 */
export const updateCartItem = async (req: Request, res: Response): Promise<Response> => {
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED });

  try {
    const { cartId, cartItemId, quantity } = req.body; // Extract values from the request body

    // Validate required fields
    if (!cartId || !cartItemId || !quantity) {
      console.log('Validation failed. Missing cartId, cartItemId, or quantity:', req.body);
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['cartId, cartItemId, and quantity are required'],
      });
    }

    if (quantity <= 0) {
      console.log('Validation failed. Quantity must be greater than 0:', quantity);
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['Quantity must be greater than 0'],
      });
    }

    // Verify the cart exists
    console.log('Fetching cart with ID:', cartId);
    const cart = await Cart.findByPk(cartId, { transaction });
    if (!cart) {
      console.log('Cart not found with ID:', cartId);
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.notFound'),
      });
    }

    // Verify the cart item exists and belongs to the specified cart
    console.log('Fetching cart item with cartItemId:', cartItemId, 'and cartId:', cartId);
    const cartItem = await CartItem.findOne({
      where: { itemId: cartItemId, cartId }, // Ensure the cartItem belongs to the specified cart
      transaction,
    });
    if (!cartItem) {
      console.log('CartItem not found or does not belong to the specified cartId:', cartId);
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.itemNotFound'),
      });
    }

    // Update the cart item
    console.log('Updating cart item with ID:', cartItemId);
    cartItem.quantity = quantity;
    cartItem.total = cartItem.price * quantity;
    await cartItem.save({ transaction });

    // Update the cart total
    console.log('Updating cart total for cartId:', cartId);
    const cartItems = await CartItem.findAll({ where: { cartId }, transaction });
    cart.totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
    await cart.save({ transaction });

    // Commit transaction
    console.log('Committing transaction for updating cart item with ID:', cartItemId);
    await transaction.commit();

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('cart.itemUpdated'),
      data: cart,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error(`Error updating cart item: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};

/**
 * Remove item from cart with transaction support
 */
export const removeCartItem = async (req: Request, res: Response): Promise<Response> => {
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED });

  try {
    const { cartId, cartItemId } = req.body; // Extract cartId and cartItemId from the request body

    console.log("!!!!!!!!!!!!!!!!");
    // Validate required fields
    if (!cartId || !cartItemId) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['cartId and cartItemId are required'],
      });
    }

    // Verify the cart exists
    console.log("@@@@@@@@@@@@@@@@@@!");

    const cart = await Cart.findByPk(cartId, { transaction });
    if (!cart) {
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.notFound'),
      });
    }
    console.log("######################");

    // Verify the cart item exists and belongs to the specified cart
    const cartItem = await CartItem.findOne({
      where: {
        itemId: cartItemId, // Use itemId instead of itemid
        cartId: cartId,
      },
      transaction,
    });

    console.log("$$$$$$$$$$$$$$$$$$$$$##########################");

    if (!cartItem) {
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.itemNotFound'),
      });
    }
    console.log("%%%%%%%%%%%%%%%%%%%%%%%");

    // Remove the cart item
    await cartItem.destroy({ transaction });
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");

    // Update the cart total
    const cartItems = await CartItem.findAll({ where: { cartId }, transaction });
    cart.totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
    await cart.save({ transaction });

    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$@@@@@@@@@@@@@@@@");

    // Commit transaction
    await transaction.commit();

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('cart.itemRemoved'),
      data: cart,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error(`Error removing cart item: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};



/**
 * Get cart content for a user (No transaction needed for read-only operation)
 */
export const getCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.user as { userId: string }; // Extract userId from the request body
    if (!userId) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['userId is required'],
      });
    }

    const cart = await Cart.findOne({
      where: { userId, status: 'active' },
      include: [
        {
          model: CartItem,
          as: 'cartItems', // Ensure this matches the alias in the association
          include: [
            {
              model: Item,
              as: 'item', // Ensure this matches the alias in the CartItem -> Item association
            },
          ],
        },
        {
          model: MenuConfiguration,
          as: 'menuConfiguration', // Ensure this matches the alias in the Cart -> MenuConfiguration association
          attributes: ['id', 'name'], // Include only the necessary fields
        },
        
      ],
    });

    if (!cart) {
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.notFound'),
      });
    }

    // Convert item images to Base64
    const cartData = cart.toJSON();
    cartData.cartItems = cartData.cartItems.map((cartItem: any) => {
      if (cartItem.item && cartItem.item.image) {
        cartItem.item.image = Buffer.from(cartItem.item.image).toString('base64');
      }
      return cartItem;
    });

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('cart.fetched'),
      data: cartData,
    });
  } catch (error: unknown) {
    logger.error(`Error fetching cart: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};




/**
 * Clear cart with transaction support
 */
export const clearCart = async (req: Request, res: Response): Promise<Response> => {
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED });

  try {
    const { userId } = req.user as { userId: string }; // Extract userId from the request body

    // Validate required fields
    if (!userId) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: getMessage('validation.validationError'),
        errors: ['userId is required'],
      });
    }

    // Find the active cart for the user
    console.log('Fetching active cart for userId:', userId);
    const cart = await Cart.findOne({ where: { userId, status: 'active' }, transaction });

    if (!cart) {
      console.log('No active cart found for userId:', userId);
      await transaction.rollback();
      return res.status(statusCodes.NOT_FOUND).json({
        message: getMessage('cart.notFound'),
      });
    }

    // Clear all items in the cart
    console.log('Clearing all items in the cart with ID:', cart.id);
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    // Remove the cart itself
    console.log('Removing the cart with ID:', cart.id);
    await cart.destroy({ transaction });

    // Commit the transaction
    console.log('Committing transaction for clearing cart with ID:', cart.id);
    await transaction.commit();

    return res.status(statusCodes.SUCCESS).json({
      message: getMessage('cart.cleared'),
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error(`Error clearing cart: ${error instanceof Error ? error.message : error}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: getMessage('error.internalServerError'),
    });
  }
};