import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoDB.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import passport from "./config/passport.js"; // <-- 1. Import your passport config

const app = express();
connectDB();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // <-- 2. Initialize passport middleware

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    success: false,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
