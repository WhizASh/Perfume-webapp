import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  fetchProducts,
  getLocalProducts,
  saveLocalProducts,
  createProduct,
  deleteProduct,
  seedProductsToFirestore,
  migrateFirestoreCatalog,
} from '../services/productsService';
import {
  fetchCategories,
  getLocalCategories,
  saveLocalCategories,
  createCategory,
  deleteCategory,
  seedCategoriesToFirestore,
} from '../services/categoriesService';
import {
  seedCarouselToFirestore,
} from '../services/carouselService';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  // Initialize immediately with cached or local catalog (0ms latency, Stale-While-Revalidate)
  const [products, setProducts] = useState(() => getLocalProducts());
  const [categories, setCategories] = useState(() => getLocalCategories());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
      setError(err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProduct = async (productData, imageFile, additionalImageFiles, videoFile) => {
    const saved = await createProduct(productData, imageFile, additionalImageFiles, videoFile);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = saved;
      } else {
        next = [saved, ...prev];
      }
      saveLocalProducts(next);
      return next;
    });
    return saved;
  };

  const removeProduct = async (id) => {
    await deleteProduct(id);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveLocalProducts(next);
      return next;
    });
  };

  const handleAddCategory = async (categoryData) => {
    const saved = await createCategory(categoryData);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = saved;
      } else {
        next = [...prev, saved];
      }
      saveLocalCategories(next);
      return next;
    });
    return saved;
  };

  const handleRemoveCategory = async (id) => {
    await deleteCategory(id);
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id && c.name?.toLowerCase() !== id?.toLowerCase());
      saveLocalCategories(next);
      return next;
    });
  };

  const seedCatalog = async () => {
    await Promise.all([
      seedProductsToFirestore(),
      seedCategoriesToFirestore(),
      seedCarouselToFirestore(),
    ]);
    await loadData();
  };

  const handleMigrateCatalog = async () => {
    const res = await migrateFirestoreCatalog();
    await loadData();
    return res;
  };

  // Dynamically compute unique fragrance families for navigation and filters
  const families = useMemo(() => {
    const famSet = new Set(['All']);
    // First add from defined categories
    categories.forEach((c) => {
      if (c.name) famSet.add(c.name);
    });
    // Then add any additional ones from products
    products.forEach((p) => {
      if (p.family) famSet.add(p.family);
    });
    return Array.from(famSet);
  }, [categories, products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        families,
        loading,
        error,
        refreshProducts: loadData,
        addProduct,
        removeProduct,
        addCategory: handleAddCategory,
        removeCategory: handleRemoveCategory,
        seedCatalog,
        migrateCatalog: handleMigrateCatalog,
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
