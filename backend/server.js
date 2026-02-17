import express from "express";
import { configDotenv } from "dotenv";
import { connectDB } from "./db/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";

configDotenv({ path: "./.env" });

const PORT = process.env.PORT || 5000;

const app = express();

//allow server receive json
app.use(express.json({ limit: "16kb" }));

//allow server to access data from url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//allow server to perform CRUD on cookies (if we donot add this req.body will be undefined)
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", //adjust this to frontend url
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

connectDB()
  .then(() =>
    app.listen(PORT, () => console.log("SERVER running on PORT: ", PORT)),
  )
  .catch((error) => console.log("Mongo db Connection failed due to: ", error));

// app.listen(PORT, () => {
//   console.log("Server running on PORT: ", PORT);
// });
