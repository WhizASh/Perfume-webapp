import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Package,
  ShoppingBag,
  Sliders,
  Image,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  ExternalLink,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCarousel } from '../context/CarouselContext';
import { fetchOrders } from '../services/ordersService';
import { isFirebaseConfigured } from '../firebase/config';
import { getWhatsAppNumber } from '../services/whatsappService';

export default function Admin() {
  const { adminUser, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const {
    products,
    categories,
    addProduct,
    removeProduct,
    addCategory,
    removeCategory,
    seedCatalog,
  } = useProducts();
  const { slides, addSlide, removeSlide, refreshSlides } = useCarousel();

  // Tab navigation: 'catalog' | 'categories' | 'carousel' | 'orders' | 'config'
  const [activeTab, setActiveTab] = useState('catalog');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Product Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    mrp: '',
    price: '',
    concentration: 'Eau de Parfum',
    family: 'Perfume',
    size: '50 ml',
    notes: '',
    badge: '',
    description: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Category Modal / Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sub: '',
    image: '',
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Carousel Modal / Form State
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [carouselForm, setCarouselForm] = useState({
    tag: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/shop',
  });
  const [carouselImageFile, setCarouselImageFile] = useState(null);
  const [carouselImagePreview, setCarouselImagePreview] = useState('');
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselSuccess, setCarouselSuccess] = useState('');
  const [carouselError, setCarouselError] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Load orders when authenticated and switching to orders tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      loadOrders();
    }
  }, [isAuthenticated, activeTab]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const list = await fetchOrders();
      setOrders(list);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCarouselImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarouselImageFile(file);
      setCarouselImagePreview(URL.createObjectURL(file));
    }
  };

  const openNewProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      mrp: '',
      price: '',
      concentration: 'Eau de Parfum',
      family: categories[0]?.name || 'Perfume',
      size: '50 ml',
      notes: '',
      badge: '',
      description: '',
      image: '',
    });
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setFormSuccess('');
    setShowAddModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      mrp: product.mrp !== undefined && product.mrp !== null ? String(product.mrp) : '',
      price: product.sellingPrice !== undefined ? String(product.sellingPrice) : String(product.price || ''),
      concentration: product.concentration || 'Eau de Parfum',
      family: product.family || categories[0]?.name || 'Perfume',
      size: product.size || '50 ml',
      notes: product.notes || '',
      badge: product.badge || '',
      description: product.description || '',
      image: product.image || '',
    });
    setImageFile(null);
    setImagePreview(product.image || '');
    setFormError('');
    setFormSuccess('');
    setShowAddModal(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      if (!productForm.name || !productForm.price) {
        throw new Error('Please fill in product name and selling price.');
      }

      await addProduct(
        {
          ...productForm,
          id: editingProductId || undefined,
        },
        imageFile
      );
      setFormSuccess(
        editingProductId
          ? 'Product & pricing updated successfully!'
          : 'Product saved successfully to catalog!'
      );

      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
        setEditingProductId(null);
      }, 1500);
    } catch (err) {
      console.error('Create product error:', err);
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      try {
        await removeProduct(id);
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setCategorySuccess('');
    setCategoryLoading(true);

    try {
      if (!categoryForm.name.trim()) {
        throw new Error('Category name is required.');
      }

      await addCategory(categoryForm);
      setCategorySuccess(`Category "${categoryForm.name}" created successfully!`);

      setCategoryForm({ name: '', sub: '', image: '' });

      setTimeout(() => {
        setShowCategoryModal(false);
        setCategorySuccess('');
      }, 1500);
    } catch (err) {
      console.error('Create category error:', err);
      setCategoryError(err.message || 'Failed to create category.');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? Products under this category will remain, but the category filter will be removed.`)) {
      try {
        await removeCategory(id);
      } catch (err) {
        alert('Failed to delete category: ' + err.message);
      }
    }
  };

  const openNewSlideModal = () => {
    setEditingSlideId(null);
    setCarouselForm({
      tag: 'LIMITED EDITION · ROYAL ARCHIVE',
      title: '',
      subtitle: '',
      description: '',
      image: '',
      ctaText: 'DISCOVER SCENTS',
      ctaLink: '/shop',
    });
    setCarouselImageFile(null);
    setCarouselImagePreview('');
    setShowCarouselModal(true);
  };

  const openEditSlideModal = (slide) => {
    setEditingSlideId(slide.id);
    setCarouselForm({
      tag: slide.tag || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      image: slide.image || '',
      ctaText: slide.ctaText || 'DISCOVER SCENTS',
      ctaLink: slide.ctaLink || '/shop',
    });
    setCarouselImageFile(null);
    setCarouselImagePreview(slide.image || '');
    setShowCarouselModal(true);
  };

  const handleSaveCarouselSlide = async (e) => {
    e.preventDefault();
    setCarouselError('');
    setCarouselSuccess('');
    setCarouselLoading(true);

    try {
      if (!carouselForm.title.trim() && !carouselForm.image && !carouselImageFile) {
        throw new Error('Please provide at least a slide headline or upload a banner image.');
      }

      await addSlide(
        {
          ...carouselForm,
          id: editingSlideId || undefined,
        },
        carouselImageFile
      );

      setCarouselSuccess(
        editingSlideId ? 'Carousel slide updated successfully!' : 'New carousel slide published!'
      );

      setTimeout(() => {
        setShowCarouselModal(false);
        setCarouselSuccess('');
        setEditingSlideId(null);
      }, 1500);
    } catch (err) {
      console.error('Save carousel slide error:', err);
      setCarouselError(err.message || 'Failed to save slide.');
    } finally {
      setCarouselLoading(false);
    }
  };

  const handleDeleteCarouselSlide = async (id, title) => {
    if (window.confirm(`Delete carousel slide "${title || id}"?`)) {
      try {
        await removeSlide(id);
      } catch (err) {
        alert('Failed to delete carousel slide: ' + err.message);
      }
    }
  };

  const handleSeed = async () => {
    if (
      window.confirm(
        'Seed all demo catalog data (Products, Categories, and Carousel Slides) to Cloud Firestore?'
      )
    ) {
      try {
        await seedCatalog();
        if (refreshSlides) await refreshSlides();
        alert('All catalog data (Products, Categories, Carousel Slides) successfully synced to Cloud Firestore!');
      } catch (err) {
        alert('Failed to seed catalog: ' + err.message);
      }
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0A0A0A] text-[#F5F5F7]">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <RefreshCw className="animate-spin" size={20} />
          <span className="text-sm tracking-wider">Verifying master session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated View (Login Screen)
  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16 text-[#F5F5F7]">
        <div className="border border-[#D4AF37]/30 bg-[#121212] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-13 place-items-center rounded-full border border-[#D4AF37] bg-[#1C1A14] text-[#D4AF37]">
              <Lock size={22} />
            </div>
            <h1 className="font-editorial text-3xl font-bold tracking-wider text-[#F5F5F7]">
              Royal Admin Portal
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
              I.K.K Perfume Management
            </p>
          </div>

          {!isFirebaseConfigured ? (
            <div className="mt-6 border border-[#D4AF37]/30 bg-[#16140E] p-4 text-xs text-[#E5C378]">
              <div className="font-bold text-[#D4AF37] mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles size={12} /> Demo Admin Credentials:
              </div>
              <div className="space-y-1">
                <p>
                  <strong>Email:</strong> <code className="bg-[#0A0A0A] px-1.5 py-0.5 rounded text-white font-mono border border-[#D4AF37]/20">admin@ikkperfume.com</code>
                </p>
                <p>
                  <strong>Password:</strong> <code className="bg-[#0A0A0A] px-1.5 py-0.5 rounded text-white font-mono border border-[#D4AF37]/20">admin123</code>
                </p>
              </div>
            </div>
          ) : null}

          {authError && (
            <div className="mt-6 flex items-center gap-2 border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                ADMIN EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ikkperfume.com"
                className="mt-1.5 w-full border border-zinc-700 bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 w-full border border-zinc-700 bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="mt-3 w-full border border-[#D4AF37] bg-[#D4AF37] py-3 text-xs font-bold tracking-[0.2em] text-black transition-all hover:bg-[#E5C378] disabled:opacity-50"
            >
              {authSubmitting ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO DASHBOARD'}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-4 text-center">
            <Link to="/" className="text-xs text-zinc-400 hover:text-[#D4AF37]">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated View (Admin Dashboard)
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8 text-[#F5F5F7]">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-4xl text-[#F5F5F7]">
              Boutique Control Hub
            </h1>
            <span className="rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#E5C378]">
              AUTHENTICATED
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Active session: <strong className="text-white">{adminUser?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 border border-[#D4AF37]/40 bg-[#141414] px-3.5 py-2 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
          >
            VIEW STORE <ExternalLink size={13} />
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 border border-zinc-700 bg-[#161616] px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-red-500 hover:text-red-400 transition-all"
          >
            <LogOut size={13} /> LOG OUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap border-b border-[#D4AF37]/20 gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'catalog'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Package size={15} /> CATALOG ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'categories'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders size={15} /> CATEGORIES ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('carousel')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'carousel'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Image size={15} /> HERO CAROUSEL ({slides.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={15} /> WHATSAPP ORDERS ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'config'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Database size={15} /> BACKEND CONFIG
        </button>
      </div>

      {/* TAB 1: CATALOG MANAGEMENT */}
      {activeTab === 'catalog' && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl text-[#F5F5F7]">
                Fragrance Catalog
              </h2>
              <p className="text-xs text-zinc-400">
                Manage inventory, bottle sizes, pricing, and high-resolution photography.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSeed}
                className="flex items-center gap-1.5 border border-[#D4AF37]/40 bg-[#161616] px-4 py-2 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                <Database size={14} /> SYNC ALL TO FIRESTORE
              </button>
              <button
                onClick={openNewProductModal}
                className="flex items-center gap-1.5 border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378] transition-all"
              >
                <Plus size={15} /> ADD NEW PERFUME
              </button>
            </div>
          </div>

          {/* Product Grid / Table */}
          <div className="mt-6 overflow-x-auto border border-[#D4AF37]/20 bg-[#121212]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D4AF37]/20 bg-[#181818] text-[10.5px] uppercase tracking-wider text-[#D4AF37]">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Family</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Pricing (Selling / Slashed MRP)</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {products.map((p) => {
                  const selling = Number(p.sellingPrice ?? p.price) || 0;
                  const mrp = Number(p.mrp) || 0;
                  const hasDiscount = mrp > selling && selling > 0;
                  const percent = hasDiscount ? Math.round(((mrp - selling) / mrp) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#1A1A1A]">
                      <td className="px-4 py-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-11 border border-[#D4AF37]/20 bg-[#0A0A0A] object-cover"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] text-zinc-400">{p.notes}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{p.family}</td>
                      <td className="px-4 py-3 text-zinc-300">{p.size}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#E5C378]">
                          ₹{selling.toLocaleString('en-IN')}
                        </div>
                        {hasDiscount ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10.5px] text-zinc-500 line-through">
                              ₹{mrp.toLocaleString('en-IN')}
                            </span>
                            <span className="inline-flex items-center rounded bg-emerald-500/20 border border-emerald-500/40 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                              {percent}% OFF
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-500">Regular Price</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.badge && (
                          <span className="rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#E5C378]">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-[#D4AF37] hover:text-[#E5C378] transition-colors"
                            title="Edit product & pricing"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: CATEGORY MANAGEMENT (NEW) */}
      {activeTab === 'categories' && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl text-[#F5F5F7]">
                Fragrance Categories & Families
              </h2>
              <p className="text-xs text-zinc-400">
                Create new categories to automatically enrich the Shop filter sidebar and homepage collection tiles.
              </p>
            </div>

            <button
              onClick={() => {
                setCategoryForm({ name: '', sub: '', image: '' });
                setShowCategoryModal(true);
              }}
              className="flex items-center gap-1.5 border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378] transition-all"
            >
              <Plus size={15} /> ADD NEW CATEGORY
            </button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.id || c.name}
                className="group relative flex flex-col justify-between overflow-hidden border border-[#D4AF37]/20 bg-[#121212] p-4 transition-all hover:border-[#D4AF37]/50"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="size-16 object-cover border border-[#D4AF37]/20 bg-[#0A0A0A]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-editorial text-xl font-semibold text-white">
                      {c.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-light truncate">
                      {c.sub || 'Curated category profile'}
                    </p>
                    <span className="text-[10px] text-[#D4AF37] tracking-wider uppercase">
                      {products.filter((p) => p.family?.toLowerCase() === c.name?.toLowerCase()).length} products
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end border-t border-[#D4AF37]/10 pt-3">
                  <button
                    onClick={() => handleDeleteCategory(c.id || c.name.toLowerCase(), c.name)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} /> Remove Category
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: CAROUSEL SLIDES MANAGEMENT (NEW) */}
      {activeTab === 'carousel' && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl text-[#F5F5F7]">
                Hero Banner Carousel
              </h2>
              <p className="text-xs text-zinc-400">
                Curate homepage luxury slides, banners, promotional badges, headlines, and destination links.
              </p>
            </div>

            <button
              onClick={openNewSlideModal}
              className="flex items-center gap-1.5 border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378] transition-all"
            >
              <Plus size={15} /> ADD NEW SLIDE
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {slides.map((s, idx) => (
              <div
                key={s.id || idx}
                className="flex flex-col md:flex-row gap-5 border border-[#D4AF37]/25 bg-[#121212] p-5 shadow-lg items-center"
              >
                {/* Slide Thumbnail Preview */}
                <div className="relative w-full md:w-64 h-36 shrink-0 overflow-hidden border border-[#D4AF37]/20 bg-[#0A0A0A]">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 text-[9px] text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                    SLIDE #{idx + 1}
                  </div>
                </div>

                {/* Content details */}
                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  {s.tag && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-black/60 px-3 py-0.5 text-[9.5px] font-semibold tracking-wider text-[#E5C378]">
                      <Tag size={11} className="text-[#D4AF37]" />
                      {s.tag}
                    </div>
                  )}

                  <h3 className="font-editorial text-2xl font-normal text-white">
                    {s.title || (
                      <span className="text-zinc-500 italic text-base">Graphic Banner (No Headline)</span>
                    )}
                  </h3>

                  {s.subtitle && (
                    <p className="text-[11px] font-medium text-[#D4AF37] tracking-wider uppercase">
                      {s.subtitle}
                    </p>
                  )}

                  {s.description && (
                    <p className="line-clamp-2 text-zinc-400 font-light text-[11px]">
                      {s.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                    <span>
                      CTA: <strong className="text-white">{s.ctaText || 'DISCOVER'}</strong>
                    </span>
                    <span>→</span>
                    <span className="font-mono text-[#D4AF37]">{s.ctaLink || '/shop'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => openEditSlideModal(s)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 border border-[#D4AF37]/40 bg-[#181818] px-3.5 py-2 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCarouselSlide(s.id, s.title)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 border border-zinc-700 bg-[#161616] px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:border-red-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-2xl text-[#F5F5F7]">
                Customer WhatsApp Orders
              </h2>
              <p className="text-xs text-zinc-400">
                Logged orders initiated by customers via the WhatsApp checkout flow.
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-1.5 border border-[#D4AF37]/30 bg-[#161616] px-3.5 py-1.5 text-xs text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} /> REFRESH
            </button>
          </div>

          {ordersLoading ? (
            <div className="py-16 text-center text-xs text-zinc-400">
              Fetching real-time orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 border border-dashed border-[#D4AF37]/20 bg-[#121212] p-12 text-center">
              <ShoppingBag className="mx-auto mb-2 text-[#D4AF37]" size={28} />
              <p className="text-sm font-semibold text-white">No customer orders recorded yet</p>
              <p className="mt-1 text-xs text-zinc-400">
                When customers click "ORDER VIA WHATSAPP", order logs will synchronize here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId || order.id}
                  className="border border-[#D4AF37]/20 bg-[#141414] p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/15 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-editorial text-xl font-bold text-[#E5C378]">
                        #{order.orderId || order.id}
                      </span>
                      <span className="rounded-full bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Redirected to WhatsApp
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {order.createdAtIso
                        ? new Date(order.createdAtIso).toLocaleString()
                        : 'Recent'}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                        Ordered Items
                      </p>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>
                              {item.name} ({item.size}) × {item.quantity}
                            </span>
                            <span className="font-semibold text-white">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-[#D4AF37]/15 pt-2 text-xs font-bold text-[#E5C378]">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 space-y-1">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                        Customer Context
                      </p>
                      {order.customerName && (
                        <p>
                          <strong className="text-white">Name:</strong> {order.customerName}
                        </p>
                      )}
                      {order.notes && (
                        <p>
                          <strong className="text-white">Delivery City / Notes:</strong> {order.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 5: BACKEND CONFIG & STATUS */}
      {activeTab === 'config' && (
        <section className="mt-8 max-w-2xl">
          <h2 className="font-editorial text-2xl text-[#F5F5F7]">
            Backend Status & Configuration
          </h2>
          <div className="mt-4 divide-y divide-[#D4AF37]/15 border border-[#D4AF37]/25 bg-[#121212] p-5 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-zinc-400">Firebase Connection:</span>
              <span
                className={
                  isFirebaseConfigured
                    ? 'font-bold text-emerald-400'
                    : 'font-bold text-amber-400'
                }
              >
                {isFirebaseConfigured
                  ? 'Connected (Live Firestore & Storage)'
                  : 'Unconfigured (Local Catalog Fallback)'}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-zinc-400">Firestore Database:</span>
              <span className="text-white">{isFirebaseConfigured ? 'Ready' : 'Mock/Local'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-zinc-400">Storage Bucket:</span>
              <span className="text-white">{isFirebaseConfigured ? 'Live Storage Active' : 'Offline Mode'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-zinc-400">Owner WhatsApp Target:</span>
              <span className="font-mono text-[#E5C378]">
                +{getWhatsAppNumber()}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* MODAL 1: ADD OR EDIT PRODUCT (WITH MRP & SELLING PRICE) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#D4AF37]/30 bg-[#141414] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#F5F5F7]">
                  {editingProductId ? 'Edit Fragrance & Pricing' : 'Add New Fragrance'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure MRP (slashed) and Selling Price (discounted with green sale tag)
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                <CheckCircle size={16} />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  PERFUME NAME *
                </label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g. Royal Oud Extrait"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* TWO PRICING OPTIONS: MRP (SLASHED) & SELLING PRICE (DISCOUNTED) */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                    MRP (₹) — MAXIMUM RETAIL PRICE
                  </label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) =>
                      setProductForm({ ...productForm, mrp: e.target.value })
                    }
                    placeholder="e.g. 4999 (Shown slashed)"
                    className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-zinc-500">
                    Original retail price (displayed with a strikethrough).
                  </p>
                </div>

                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px] flex items-center justify-between">
                    <span>SELLING PRICE (₹) *</span>
                    {productForm.mrp && Number(productForm.mrp) > Number(productForm.price) && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-400">
                        {Math.round(((Number(productForm.mrp) - Number(productForm.price)) / Number(productForm.mrp)) * 100)}% DISCOUNT
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    placeholder="e.g. 3499 (Discounted price)"
                    className="mt-1 w-full border border-[#D4AF37]/50 bg-[#0A0A0A] p-2.5 text-[#E5C378] font-semibold focus:border-[#D4AF37] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-zinc-500">
                    Discounted selling price (shown with green sale tag).
                  </p>
                </div>
              </div>

              {/* Live Discount Summary if MRP > Selling Price */}
              {productForm.mrp && Number(productForm.mrp) > Number(productForm.price) && (
                <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-400 rounded">
                  <span className="font-bold">🏷️ Green Sale Tag Preview:</span>
                  <span>
                    MRP <span className="line-through">₹{Number(productForm.mrp).toLocaleString('en-IN')}</span> → Selling Price ₹{Number(productForm.price).toLocaleString('en-IN')} (Save ₹{(Number(productForm.mrp) - Number(productForm.price)).toLocaleString('en-IN')} · {Math.round(((Number(productForm.mrp) - Number(productForm.price)) / Number(productForm.mrp)) * 100)}% OFF)
                  </span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                    FRAGRANCE FAMILY
                  </label>
                  <select
                    value={productForm.family}
                    onChange={(e) =>
                      setProductForm({ ...productForm, family: e.target.value })
                    }
                    className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name} className="bg-[#121212]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                    CONCENTRATION
                  </label>
                  <input
                    value={productForm.concentration}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        concentration: e.target.value,
                      })
                    }
                    placeholder="Eau de Parfum / Extrait"
                    className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                    BOTTLE SIZE
                  </label>
                  <input
                    value={productForm.size}
                    onChange={(e) =>
                      setProductForm({ ...productForm, size: e.target.value })
                    }
                    placeholder="50 ml / 12 ml Attar"
                    className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  SCENT NOTES
                </label>
                <input
                  value={productForm.notes}
                  onChange={(e) =>
                    setProductForm({ ...productForm, notes: e.target.value })
                  }
                  placeholder="e.g. Saffron · Cambodian Oud · Ambergris"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  BADGE (OPTIONAL)
                </label>
                <input
                  value={productForm.badge}
                  onChange={(e) =>
                    setProductForm({ ...productForm, badge: e.target.value })
                  }
                  placeholder="Bestseller / Royal Reserve / Limited"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="An exquisite olfactory journey..."
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* IMAGE UPLOAD */}
              <div className="border border-dashed border-[#D4AF37]/40 p-4 bg-[#0A0A0A]">
                <label className="block font-bold text-[#D4AF37] uppercase text-[10px]">
                  PRODUCT PHOTO
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 w-full text-xs text-zinc-400 file:mr-3 file:border file:border-[#D4AF37]/40 file:bg-[#161616] file:px-3 file:py-1.5 file:text-xs file:text-[#D4AF37] file:cursor-pointer"
                />

                {imagePreview ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-16 object-cover border border-[#D4AF37]/30"
                    />
                    <span className="text-[11px] text-[#E5C378]">
                      Photo ready for upload
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-zinc-500">
                    Or specify an existing image URL:
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full border border-zinc-700 bg-[#161616] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378] disabled:opacity-50"
                >
                  {formLoading ? 'SAVING...' : editingProductId ? 'UPDATE PRODUCT & PRICING' : 'SAVE PERFUME'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW CATEGORY (NEW) */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md border border-[#D4AF37]/30 bg-[#141414] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#F5F5F7]">
                  Add Fragrance Category
                </h3>
                <p className="text-xs text-zinc-400">
                  Adds a new family filter to the store and category showcase
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {categorySuccess && (
              <div className="mt-4 flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                <CheckCircle size={16} />
                <span>{categorySuccess}</span>
              </div>
            )}

            {categoryError && (
              <div className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle size={16} />
                <span>{categoryError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  CATEGORY NAME *
                </label>
                <input
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="e.g. Attars, Bakhoor, Oriental"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  SUBTITLE / NOTES (OPTIONAL)
                </label>
                <input
                  value={categoryForm.sub}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, sub: e.target.value })
                  }
                  placeholder="e.g. Pure Concentrated Oil · Alcohol-Free"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  COVER PHOTO URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  If left blank, an elegant default perfume photography cover will be applied.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378] disabled:opacity-50"
                >
                  {categoryLoading ? 'CREATING...' : 'CREATE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CAROUSEL SLIDE (NEW WITH PROMOTIONAL TAG) */}
      {showCarouselModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#D4AF37]/30 bg-[#141414] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#F5F5F7]">
                  {editingSlideId ? 'Edit Carousel Slide' : 'Publish New Carousel Slide'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Manage high-resolution banner visuals, promotional discounts, and headlines
                </p>
              </div>
              <button
                onClick={() => setShowCarouselModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {carouselSuccess && (
              <div className="mt-4 flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                <CheckCircle size={16} />
                <span>{carouselSuccess}</span>
              </div>
            )}

            {carouselError && (
              <div className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle size={16} />
                <span>{carouselError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCarouselSlide} className="mt-4 space-y-4 text-xs">
              {/* EDITABLE PROMOTIONAL TAG / BADGE */}
              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px] flex items-center gap-1.5">
                  <Tag size={12} /> PROMOTIONAL TAG / BADGE
                </label>
                <input
                  value={carouselForm.tag}
                  onChange={(e) =>
                    setCarouselForm({ ...carouselForm, tag: e.target.value })
                  }
                  placeholder="e.g. FESTIVE OFFER · UP TO 40% OFF / LIMITED ARCHIVE"
                  className="mt-1 w-full border border-[#D4AF37]/40 bg-[#0A0A0A] p-2.5 text-[#E5C378] font-medium focus:border-[#D4AF37] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  This tag appears with a golden sparkle badge atop the slide title.
                </p>
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  SLIDE HEADLINE / TITLE (OPTIONAL)
                </label>
                <input
                  value={carouselForm.title}
                  onChange={(e) =>
                    setCarouselForm({ ...carouselForm, title: e.target.value })
                  }
                  placeholder="e.g. The Sovereign Oud Collection (Leave blank for graphic banner)"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  SUBTITLE / EYEBROW
                </label>
                <input
                  value={carouselForm.subtitle}
                  onChange={(e) =>
                    setCarouselForm({ ...carouselForm, subtitle: e.target.value })
                  }
                  placeholder="e.g. 100% Alcohol-Free Concentrated Oil Nectar"
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                  DESCRIPTION / CAMPAIGN STORY
                </label>
                <textarea
                  rows={2}
                  value={carouselForm.description}
                  onChange={(e) =>
                    setCarouselForm({
                      ...carouselForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Distilled from rare wild agarwood aged over twenty years..."
                  className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                    BUTTON CTA TEXT
                  </label>
                  <input
                    value={carouselForm.ctaText}
                    onChange={(e) =>
                      setCarouselForm({ ...carouselForm, ctaText: e.target.value })
                    }
                    placeholder="e.g. EXPLORE OUDS"
                    className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold tracking-wider text-[#D4AF37] uppercase text-[10px]">
                    TARGET LINK (URL OR PATH)
                  </label>
                  <input
                    value={carouselForm.ctaLink}
                    onChange={(e) =>
                      setCarouselForm({ ...carouselForm, ctaLink: e.target.value })
                    }
                    placeholder="e.g. /shop?family=Oud"
                    className="mt-1 w-full border border-zinc-700 bg-[#0A0A0A] p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* CAROUSEL BANNER PHOTO */}
              <div className="border border-dashed border-[#D4AF37]/40 p-4 bg-[#0A0A0A]">
                <label className="block font-bold text-[#D4AF37] uppercase text-[10px]">
                  CAROUSEL BANNER PHOTO
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCarouselImageChange}
                  className="mt-2 w-full text-xs text-zinc-400 file:mr-3 file:border file:border-[#D4AF37]/40 file:bg-[#161616] file:px-3 file:py-1.5 file:text-xs file:text-[#D4AF37] file:cursor-pointer"
                />

                {carouselImagePreview ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={carouselImagePreview}
                      alt="Banner Preview"
                      className="h-16 w-32 object-cover border border-[#D4AF37]/30"
                    />
                    <span className="text-[11px] text-[#E5C378]">
                      Banner image ready
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-zinc-500">
                    Or specify an existing image URL:
                    <input
                      type="url"
                      value={carouselForm.image}
                      onChange={(e) =>
                        setCarouselForm({ ...carouselForm, image: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="mt-1 w-full border border-zinc-700 bg-[#161616] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCarouselModal(false)}
                  className="border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={carouselLoading}
                  className="border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378] disabled:opacity-50"
                >
                  {carouselLoading ? 'SAVING...' : editingSlideId ? 'UPDATE SLIDE' : 'PUBLISH SLIDE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
