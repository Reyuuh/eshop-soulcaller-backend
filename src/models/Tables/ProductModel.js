import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  img_url: { type: DataTypes.STRING, allowNull: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Product;