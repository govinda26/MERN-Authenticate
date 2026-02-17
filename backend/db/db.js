//Project Name - MERN Auth   Cluster - Cluster-1
//userName - govindarsharma
//password- Pogoland@26
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI + "/" + DB_NAME
    );
    console.log("Mongo DB connected: ", connectionInstance?.connection?.host);
  } catch (error) {
    console.log("Error while connecting db: ", error);
    process.exit(1);
  }
};
