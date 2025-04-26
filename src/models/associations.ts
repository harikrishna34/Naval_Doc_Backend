import Item from './item';
import Pricing from './pricing';

export const defineAssociations = () => {
  // Define associations between Item and Pricing
  Item.hasOne(Pricing, { foreignKey: 'itemId', as: 'pricing' });
  Pricing.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
};