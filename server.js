import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDb from "./db/connectDb.js";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/note.js";

connectDb();

dotenv.config();
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
