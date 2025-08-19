import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    }, //created at and updated at
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
//converted to products by mongoose

export default Product;
