import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "production" ? null : err.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
