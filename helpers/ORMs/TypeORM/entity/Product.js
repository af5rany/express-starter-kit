var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    sku: {
      type: "varchar",
      nullable: true,
    },
    stock_quantity: {
      type: "int",
      default: 0,
    },
    salla_product_id: {
      type: "bigint",
      nullable: true,
      unique: true,
    },
  },
});
