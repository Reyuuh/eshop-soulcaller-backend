// models/Order.js
import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // ← add this
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // createdAt and updatedAt are automatically handled by timestamps: true
  },
  {
    tableName: "orders", // ensure it uses the existing table
    timestamps: true,    // because you have createdAt/updatedAt columns
  }
);

export default Order;