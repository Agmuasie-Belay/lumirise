import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.image || !newProduct.price) {
      return {
        success: false,
        message: "Please return all values",
      };
    }
    const res = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });
    const data = await res.json();
    set((state) => ({ products: [...state.products, data.data] }));
    return { success: true, message: "Product created successfully" };
  },
  fetchProducts: async () => {
    const res = await fetch("http://localhost:3000/api/products");
    const data = await res.json();
    set({ products: data.data });
  },
  deleteProduct: async (product_id) => {
    const res = await fetch(
      `http://localhost:3000/api/products/${product_id}`,
      {
        method: "DELETE",
      }
    );
     const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    //update the ui immediately, without needing a fetch
    set((state) => ({
      products: state.products.filter((product) => product._id !== product_id),
    }));
    return { success: true, message: data.message };
  },
  updateProduct: async (product_id, updateProduct)=>{
    const res = await fetch(`http://localhost:3000/api/products/${product_id}`, {
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(updateProduct),
    });
    const data = await res.json();
    if(!data.success) return {success:false, message:data.message}
    set(state=>({
      products:state.products.map(product=>product._id===product_id?data.data:product)
    }))

    return {success:true, message:data.message}
  }
}));
