import sequelize from "./sequelize.js";

import User from "./UserModel.js";
import Product from "./ProductModel.js";
import Order from "./OrderModel.js";
import OrderItem from "./OrderItemModel.js";
import Category from "./CategoryModel.js";

// User ↔ Orders
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Orders ↔ OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Categories ↔ Products
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Products ↔ OrderItems  ✅ IMPORTANT (you were missing this)
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
