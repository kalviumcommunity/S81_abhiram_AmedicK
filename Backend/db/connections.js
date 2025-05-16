const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose
  .connect(process.env.mongodb)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
module.exports = connection;
