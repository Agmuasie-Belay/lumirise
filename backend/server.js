import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import productRoutes from './routes/product.route.js';

import cors from "cors";

const app = express();

// Allow requests from Vite dev server
app.use(cors({
  origin: "http://localhost:5173",   // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true
}));
dotenv.config();

const PORT = process.env.PORT;

const __dirname = path.resolve();

app.use(express.json());
app.use('/api/products', productRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  })
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

