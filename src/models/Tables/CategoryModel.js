import { DataTypes } from "sequelize";
import { asyncHandler} from "../../utils/asyncHandler.js";
import sequelize from "../sequelize.js";

const Category = sequelize.define("Category", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
});

export default Category;