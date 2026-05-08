const SALLA_API = "https://api.salla.dev/admin/v2";

const WEBHOOK_EVENTS = [
  "product.created",
  "product.updated",
  "product.deleted",
  "order.created",
  "order.updated",
  "product.quantity.low",
];

module.exports = async (eventBody, userArgs) => {
  const accessToken = eventBody?.data?.token?.access_token;
  if (!accessToken) {
    console.error("store.authorize: no access_token in event body");
    return;
  }

  const db = userArgs?.db;
  if (!db?.connection) {
    console.error("store.authorize: no DB connection");
    return;
  }

  const appUrl = process.env.APP_URL || "https://tabreed-1mho.onrender.com";
  const webhookUrl = `${appUrl}/webhook`;

  for (const event of WEBHOOK_EVENTS) {
    try {
      const res = await fetch(`${SALLA_API}/webhooks/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `auto:${event}`,
          event,
          url: webhookUrl,
          version: 2,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        console.log(`✓ subscribed ${event} (id=${json?.data?.id})`);
      } else {
        console.error(`✗ subscribe failed ${event}:`, JSON.stringify(json));
      }
    } catch (err) {
      console.error(`✗ subscribe error ${event}:`, err.message);
    }
  }

  const Product = db.connection.Mongoose.models.Product;
  const unsynced = await Product.find({ salla_product_id: null });

  for (const product of unsynced) {
    try {
      const res = await fetch(`${SALLA_API}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: product.name,
          price: { amount: product.price },
          sku: product.sku,
          quantity: product.stock_quantity,
        }),
      });

      const json = await res.json();
      const sallaId = json?.data?.id;

      if (sallaId) {
        await Product.findByIdAndUpdate(product._id, { salla_product_id: String(sallaId) });
      } else {
        console.error(`store.authorize: failed to sync product ${product._id}`, json);
      }
    } catch (err) {
      console.error(`store.authorize: error syncing product ${product._id}:`, err.message);
    }
  }
};
