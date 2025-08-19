import Product from '../config/models/product.model.js';    
import mongoose from 'mongoose';
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    console.log("Products fetched successfully:", products);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const createProduct =  async (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price || !image) {
    return res.status(400).json({
      success: false,
      message: "Please provide all fields",
    });
  }
  const newProduct = new Product({ name, price, image });
  try {
    await newProduct.save();
    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error("Error in create product:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateProduct = async (req, res)=>{
  const {id} = req.params;
  const product = req.body;

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({success:false, message:"Invalid product ID"});
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {new:true});
    res.status(200).json({success:true, message:"Product updated successfully!", data:updatedProduct})
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
} 

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete product:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}