const sequelize = require("./sequelize.js");
const User = require("./UserModel.js");
const Product = require("./ProductModel.js");
const Order = require("./OrderModel.js");
const OrderItem = require("./OrderItemModel.js");
const Category = require("./CategoryModel.js");

// Define associations
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Product, { foreignKey: "category_id" });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Category,
};