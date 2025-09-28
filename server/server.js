import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import otpRoute from "./routes/otpRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*" // allow frontend domain in production
}));
app.use(express.json());

app.use("/api", otpRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
