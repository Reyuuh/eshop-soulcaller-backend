// models/index.js
import sequelize from "./sequelize.js";

import User from "./Tables/UserModel.js";
import Product from "./Tables/ProductModel.js";
import Order from "./Tables/OrderModel.js";
import OrderItem from "./Tables/OrderItemModel.js";
import Category from "./Tables/CategoryModel.js";

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Category,
};
