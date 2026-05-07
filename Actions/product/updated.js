module.exports = async (eventBody, userArgs) => {
  const data = eventBody?.data;
  if (!data?.id) return;

  const db = userArgs?.db;
  if (!db?.connection) {
    console.error("product.updated: no DB connection");
    return;
  }

  const Product = db.connection.Mongoose.models.Product;

  try {
    const updates = {};
    if (data.name) updates.name = data.name;
    if (data.price?.amount != null) updates.price = data.price.amount;
    if (data.sku) updates.sku = data.sku;
    if (data.quantity != null) updates.stock_quantity = data.quantity;

    if (Object.keys(updates).length > 0) {
      await Product.findOneAndUpdate({ salla_product_id: String(data.id) }, updates);
    }
  } catch (err) {
    console.error(`product.updated: error updating product ${data.id}:`, err.message);
  }
};
