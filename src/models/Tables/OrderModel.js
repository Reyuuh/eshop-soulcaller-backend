// models/Tables/OrderModel.js
import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;
