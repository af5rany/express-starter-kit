module.exports = async (eventBody, userArgs) => {
  const data = eventBody?.data;
  if (!data?.id) return;

  const db = userArgs?.db;
  if (!db?.connection) {
    console.error("product.quantity.low: no DB connection");
    return;
  }

  const Product = db.connection.Mongoose.models.Product;

  try {
    const product = await Product.findOne({ salla_product_id: String(data.id) });
    if (!product) return;

    console.warn(`LOW STOCK: "${product.name}" (salla_id: ${data.id}) — quantity: ${data.quantity ?? product.stock_quantity}`);

    if (data.quantity != null) {
      await Product.findByIdAndUpdate(product._id, { stock_quantity: data.quantity });
    }
  } catch (err) {
    console.error(`product.quantity.low: error for product ${data.id}:`, err.message);
  }
};
