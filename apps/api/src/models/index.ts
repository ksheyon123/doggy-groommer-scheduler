import sequelize from "../config/database";
import { User } from "./User";
import { Shop } from "./Shop";
import { Employee } from "./Employee";
import { Dog } from "./Dog";
import { GroomingAppointment } from "./GroomingAppointment";

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    // Sync all models
    // force: true will drop tables if they exist, useful for dev when schema changes
    // alter: true updates tables to match models
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, initDB, User, Shop, Employee, Dog, GroomingAppointment };
