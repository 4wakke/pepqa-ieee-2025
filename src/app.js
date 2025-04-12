import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import checkPayments from "./cron.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
checkPayments();
// Middlewares
const allowedOrigins = [
  'http://localhost:5173', 
  'http://ieeecolcaribeconference.com:5173/',
  'http://18.209.168.40:80',
  'http://ieeecolcaribeconference.com',
  'http://localhost:5174',
  'https://pepqa.ieeecolcaribeconference.com',
  'http://186.98.2.31'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.get("/", (req, res) => res.json({ message: "test response" }));
app.use("/api", authRoutes);
app.use("/api", adminRoutes);

//Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;
