const mongoose = require("mongoose");
const { Product } = require("../models/product");

module.exports = async () => {
  const url = process.env.MONGODB_URL;
  mongoose.connect(url);
  const db = mongoose.connection;
  db.on("open", () => console.log("🎉 DB is live 🎉", "on", url));
  db.on("error", (error) => console.error(error));
  return db;
};
