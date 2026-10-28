import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  seedProductsToFirestore,
} from '../services/productsService';
import { families as initialFamilies } from '../data/products';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (productData, imageFile) => {
    const saved = await createProduct(productData, imageFile);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const removeProduct = async (id) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const seedCatalog = async () => {
    await seedProductsToFirestore();
    await loadProducts();
  };

  // Dynamically compute unique fragrance families
  const families = useMemo(() => {
    const famSet = new Set(initialFamilies);
    products.forEach((p) => {
      if (p.family) famSet.add(p.family);
    });
    return Array.from(famSet);
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        families,
        loading,
        error,
        refreshProducts: loadProducts,
        addProduct,
        removeProduct,
        seedCatalog,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
