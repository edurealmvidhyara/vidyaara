const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const connect = require("./config/db");
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

const userController = require("./controller/user.controller");
const courseController = require("./controller/course.controller");
const wishlistController = require("./controller/wishlist.controller");
const { authenticate } = require("./middlewares/authenticate");

// Public routes
app.use("/api/users", userController);

// Protected routes
app.use("/api/courses", courseController);
app.use("/api/wishlist", authenticate, wishlistController);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running", timestamp: new Date() });
});

// Authentication test route
app.post("/api/auth", authenticate, async (req, res) => {
  try {
    return res.status(200).send({ auth: true, user: req.user });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(PORT, async () => {
  try {
    await connect();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
});
