// models/dbInit.js
import { sequelize } from "./index.js";

export async function dbInit() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log("Database Initialization Complete!");
  } catch (error) {
    console.error("Database Initialization Failed:", error);
    process.exit(1);
  }
}
