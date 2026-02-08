import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import path from "path";
import api from "./src/routes/index";
import errorHandler from "./src/middleware/errorHandler";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Initialize Passport
import "./src/middleware/auth";
app.use(passport.initialize());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/isdn/api", api);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "User Management Backend is running" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
