import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';

import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CarouselProvider } from './context/CarouselContext';

import './index.css';

function App() {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const cartItemId =
        product.cartItemId ||
        (product.selectedVariant ? `${product.id}-${product.selectedVariant.name}` : product.id);
      const addQty = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
      const existingItem = prevCart.find((item) => (item.cartItemId || item.id) === cartItemId);
      if (existingItem) {
        return prevCart.map((item) =>
          (item.cartItemId || item.id) === cartItemId
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      return [...prevCart, { ...product, cartItemId, quantity: addQty }];
    });
    setOpen(true);
  };

  const handleQuantityChange = (cartItemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          (item.cartItemId || item.id) === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar
        count={totalCartCount}
        onCartOpen={() => setOpen(true)}
      />

      <Routes>
        <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
        <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} />} />
        <Route
          path="/product/:id"
          element={<ProductDetails onAddToCart={handleAddToCart} />}
        />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="*"
          element={<div className="p-20 text-center text-zinc-400">Page not found</div>}
        />
      </Routes>

      <Footer />

      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={cart}
        onQuantity={handleQuantityChange}
        onClearCart={handleClearCart}
      />
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductProvider>
        <CarouselProvider>
          <App />
        </CarouselProvider>
      </ProductProvider>
    </AuthProvider>
  </React.StrictMode>
);
