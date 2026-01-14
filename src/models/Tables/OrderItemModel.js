// models/Tables/OrderItemModel.js
import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    tableName: "order_items",
    timestamps: true,
  }
);

export default OrderItem;

