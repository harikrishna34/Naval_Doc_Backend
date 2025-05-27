import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import authRoutes from './routes/authRoutes';
import canteenRoutes from './routes/canteenRoutes';
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import menuConfigurationRoutes from './routes/menuConfigurationRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import adminDashboardRoutes from './routes/adminDashboardRoutes';
import voiceRoutes from './routes/voiceRoutes';





import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';
import cors from 'cors';
import { sequelize } from './config/database'; // Updated import
import User from './models/user';
import UserRole from './models/userRole';
import Role from './models/role';

import Menu from './models/menu';
import MenuItem from './models/menuItem';
import Item from './models/item';
import MenuConfiguration from './models/menuConfiguration';
import Canteen from './models/canteen';
import cartRoutes from './routes/cartRoutes';
import Pricing from './models/pricing';
import CartItem from './models/cartItem'; // Import CartItem
import Cart from './models/cart'; // Import Cart
import Order from './models/order';
import OrderItem from './models/orderItem';
import Payment from './models/payment';
import axios from 'axios';

import { v4 as uuidv4 } from 'uuid';

import crypto from 'crypto';

const AIRTEL_USERNAME = 'your_username'; // Replace with your HMAC username
const AIRTEL_SECRET = 'your_secret';     // Replace with your HMAC secret key
function getGMTDate(): string {
  return new Date().toUTCString();
}
function generateHMACAuth(body: any, date: string): string {
  const content = JSON.stringify(body);
  const hmac = crypto
    .createHmac('sha256', AIRTEL_SECRET)
    .update(content + date)
    .digest('base64');

  return `HMAC ${AIRTEL_USERNAME}:${hmac}`;
}







dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Enable CORS
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Initialize models
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    canteenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  { sequelize, modelName: 'User' }
);
Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, modelName: 'Role' }
);
UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'UserRole' }
);

// User and Role associations
User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles' }); // Alias for User -> UserRole
UserRole.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Reverse association
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' }); // Alias for UserRole -> Role
Role.hasMany(UserRole, { foreignKey: 'roleId', as: 'roleUserRoles' }); // Updated alias to avoid conflicts

// Menu and MenuItem associations
Menu.hasMany(MenuItem, { foreignKey: 'menuId', as: 'menuItems' }); // Alias for Menu -> MenuItem
MenuItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' }); // Reverse association
MenuItem.belongsTo(Item, { foreignKey: 'itemId', as: 'menuItemItem' }); // Updated alias to avoid conflicts

// Menu and Canteen/MenuConfiguration associations
Menu.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'menuCanteen' }); // Updated alias to avoid conflicts
Menu.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'menuMenuConfiguration' }); // Updated alias

// Cart and CartItem associations
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'cartItems' }); // Alias for Cart -> CartItem
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' }); // Reverse association

// Item and CartItem associations
Item.hasMany(CartItem, { foreignKey: 'itemId', as: 'itemCartItems' }); // Updated alias to avoid conflicts
CartItem.belongsTo(Item, { foreignKey: 'itemId', as: 'cartItemItem' }); // Updated alias to avoid conflicts

// Cart and MenuConfiguration/Canteen associations
Cart.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'cartMenuConfiguration' }); // Updated alias
Cart.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'cartCanteen' }); // Updated alias

// Order and User associations
// Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' }); // Updated alias to avoid conflicts
// User.hasMany(Order, { foreignKey: 'userId', as: 'userOrders' }); // Updated alias to avoid conflicts


Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' }); // Alias for Order -> User
User.hasMany(Order, { foreignKey: 'userId', as: 'userOrders' }); // Reverse association

// Menu and Canteen association
Menu.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'canteenMenu' }); // Alias for Menu -> Canteen
Canteen.hasMany(Menu, { foreignKey: 'canteenId', as: 'canteenMenus' }); // Reverse association

// Order and Canteen association
Order.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'orderCanteen' }); // Updated alias
Canteen.hasMany(Order, { foreignKey: 'canteenId', as: 'canteenOrders' }); // Reverse association


// Order and OrderItem associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' }); // Alias for Order -> OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' }); // Reverse association


// Order and Payment associations
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' }); // Alias for Order -> Payment
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' }); // Reverse association

// OrderItem and Item associations
OrderItem.belongsTo(Item, { foreignKey: 'itemId', as: 'menuItemItem' }); // Alias for OrderItem -> Item
Item.hasMany(OrderItem, { foreignKey: 'itemId', as: 'itemOrderItems' }); // Reverse association


CartItem.belongsTo(MenuItem, { as: 'menuItem', foreignKey: 'itemId' });


// Associate Item with Pricing
Item.hasOne(Pricing, { foreignKey: 'itemId', as: 'itemPricing' }); // Associate Item with Pricing
Pricing.belongsTo(Item, { foreignKey: 'itemId', as: 'pricingItem' }); // Updated alias to avoid conflict


sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully!');
});

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/canteen', canteenRoutes);

app.use('/api/user', userRoutes);

app.use('/api/item', itemRoutes);

app.use('/api/menu', menuRoutes);

app.use('/api/menuconfig', menuConfigurationRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/order', orderRoutes);

app.use('/api/adminDasboard', adminDashboardRoutes);

app.use('/api/voice', voiceRoutes);





//  const AIRTEL_API_URL = process.env.AIRTEL_API_URL!;
const AIRTEL_TOKEN = process.env.AIRTEL_TOKEN!;
// const FROM_NUMBER = process.env.FROM_NUMBER!; // Airtel-registered number

const AIRTEL_API_URL = "https://iqwhatsapp.airtel.in/gateway/airtel-xchange/basic/whatsapp-manager/v1/session/send/text"

const FROM_NUMBER = 917337068888

interface UserSession {
  items: string[];
  confirmed: boolean;
}


// 🔄 Webhook to receive incoming messages from Airtel
const sessions: Record<string, { items: string[]; confirmed: boolean }> = {};

const MENU = {
  '1': { name: 'Pizza', price: 199 },
  '2': { name: 'Burger', price: 99 },
  '3': { name: 'Pasta', price: 149 },
};

app.post('/webhook', async (req: Request, res: Response) => {
  console.log('Received webhook request:', req.body);

  let from: string;
  let text: string;
  let senderName: string;

  // Detect the payload format and extract relevant fields
  if (req.body.from && req.body.message?.text?.body) {
    // Format 1
    from = req.body.from;
    text = req.body.message.text.body.trim().toLowerCase();
    senderName = req.body.profile?.name || 'Customer'; // Default to 'Customer' if name is not provided
  } else if (req.body.sourceAddress && req.body.messageParameters?.text?.body) {
    // Format 2
    from = req.body.sourceAddress;
    text = req.body.messageParameters.text.body.trim().toLowerCase();
    senderName = 'Customer'; // No sender name in this format
  } else {
    console.error('Invalid webhook payload:', req.body);
    return res.status(400).json({ message: 'Invalid webhook payload.' });
  }

  console.log(`📥 Incoming message from ${from} (${senderName}): ${text}`);

  // Initialize session if it doesn't exist
  if (!sessions[from]) {
    sessions[from] = { items: [], confirmed: false };
  }

  const session = sessions[from];
  let reply = '';

  // Handle different message types
  if (text === 'hi' || text === 'hello') {
    reply = `👋 Welcome to FoodieBot, ${senderName}! Here's our menu:\n`;
    for (const [key, item] of Object.entries(MENU)) {
      reply += `${key}. ${item.name} - ₹${item.price}\n`;
    }
    reply += '\nReply with item numbers to order (e.g., 1,2)';
  } else if (/^\d+(,\d+)*$/.test(text)) {
    session.items = text.split(',').map((id: string) => id.trim());
    const itemNames = session.items.map(id => MENU[id as keyof typeof MENU]?.name || '❓').join(', ');
    reply = `✅ You selected: ${itemNames}\nReply YES to confirm your order.`;
  } else if (text === 'yes' && session.items.length > 0 && !session.confirmed) {
    session.confirmed = true;
    reply = '🎉 Order placed! Please share your delivery address.';
  } else if (session.confirmed && session.items.length > 0) {
    reply = `📦 Thanks! Your order will be delivered to:\n${text}\nEnjoy your meal! 🍽️`;
    delete sessions[from];
  } else {
    reply = "❓ I didn't understand that. Please type 'Hi' to see the menu.";
  }

  // 📨 Send reply via Airtel API
  console.log(`📤 Sending reply to ${from}: ${reply}`,FROM_NUMBER) ;
  console.log(`Airtel API URL: ${AIRTEL_API_URL}`);
  console.log(`Airtel Token: ${AIRTEL_TOKEN}`);
  console.log(`From Number: ${FROM_NUMBER}`);

  try {
    await axios.post(
      AIRTEL_API_URL,
      {
        sessionId: req.body.sessionId || generateUuid(), // Use sessionId from the payload or generate a new one
        to: from,
        from: FROM_NUMBER,
        message: {
          text: reply,
        },
      },
      {
        auth: {
          username: 'world_tek', // Replace with your actual username
          password: 'T7W9&w3396Y"', // Replace with your actual password
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`📤 Reply sent to ${from}`);
  } catch (err: any) {
    console.error('❌ Error sending reply via Airtel:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
    }
  }

  res.sendStatus(200);
});









app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function generateUuid(): string {
  return uuidv4();
}
