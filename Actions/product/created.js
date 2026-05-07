module.exports = async (eventBody, userArgs) => {
  console.log("product.created payload:", JSON.stringify(eventBody?.data, null, 2));
  const data = eventBody?.data;
  if (!data?.id) return;

  const db = userArgs?.db;
  if (!db?.connection) {
    console.error("product.created: no DB connection");
    return;
  }

  const Product = db.connection.Mongoose.models.Product;

  try {
    await Product.findOneAndUpdate(
      { salla_product_id: String(data.id) },
      {
        salla_product_id: String(data.id),
        name: data.name,
        price: data.price?.amount ?? null,
        sku: data.sku ?? null,
        stock_quantity: data.quantity ?? 0,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`product.created: error saving product ${data.id}:`, err.message);
  }
};
