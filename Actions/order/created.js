module.exports = async (eventBody, userArgs) => {
  const items = eventBody?.data?.items;
  if (!Array.isArray(items) || items.length === 0) return;

  const db = userArgs?.db;
  if (!db?.connection) {
    console.error("order.created: no DB connection");
    return;
  }

  const Product = db.connection.Mongoose.models.Product;

  for (const item of items) {
    const sallaProductId = String(item?.product?.id ?? item?.product_id ?? "");
    const qty = item?.quantity ?? 1;

    if (!sallaProductId) continue;

    try {
      const product = await Product.findOne({ salla_product_id: sallaProductId });
      if (!product) continue;

      const newQty = Math.max(0, product.stock_quantity - qty);
      await Product.findByIdAndUpdate(product._id, { stock_quantity: newQty });
    } catch (err) {
      console.error(`order.created: error updating stock for salla_product_id ${sallaProductId}:`, err.message);
    }
  }
};
