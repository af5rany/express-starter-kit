const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: null },
  sku: { type: String, default: null },
  stock_quantity: { type: Number, default: 0 },
  salla_product_id: { type: String, default: null, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
