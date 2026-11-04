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
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F4EBD9] text-[#0D0C0A]">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <RefreshCw className="animate-spin" size={20} />
          <span className="text-sm font-kufi tracking-wider font-bold">Verifying master session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated View (Login Screen)
  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16 text-[#0D0C0A]">
        <div className="border-2 border-[#D4AF37]/50 bg-[#FAF6ED] p-8 shadow-[0_10px_40px_rgba(212,175,55,0.25)]">
          <div className="text-center flex flex-col items-center">
            <img
              src="/logo.png"
              alt="I.K.K Perfume Official Logo"
              className="h-16 w-auto object-contain mb-3"
            />
            <h1 className="font-rakkas text-3xl font-normal tracking-wide text-[#0D0C0A]">
              Royal Admin Portal
            </h1>
            <p className="font-kufi mt-1 text-[10px] uppercase tracking-[0.25em] text-[#9E781E] font-bold">
              I.K.K Perfume Management
            </p>
          </div>

          {!isFirebaseConfigured ? (
            <div className="mt-6 border-2 border-[#C59B27]/40 bg-[#EFE3C8] p-4 text-xs text-[#9E781E]">
              <div className="font-bold text-[#9E781E] mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-kufi">
                <Sparkles size={12} /> Demo Admin Credentials:
              </div>
              <div className="space-y-1">
                <p>
                  <strong>Email:</strong> <code className="bg-[#FAF6ED] px-1.5 py-0.5 rounded text-[#0D0C0A] font-mono border border-[#C59B27]/40">admin@ikkperfume.com</code>
                </p>
                <p>
                  <strong>Password:</strong> <code className="bg-[#FAF6ED] px-1.5 py-0.5 rounded text-[#0D0C0A] font-mono border border-[#C59B27]/40">admin123</code>
                </p>
              </div>
            </div>
          ) : null}

          {authError && (
            <div className="mt-6 flex items-center gap-2 border border-red-500/40 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="font-kufi block text-[10px] font-bold tracking-[0.2em] text-[#9E781E] uppercase">
                ADMIN EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ikkperfume.com"
                className="mt-1.5 w-full border border-[#C59B27]/40 bg-white px-3.5 py-2.5 text-sm text-[#0D0C0A] outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="font-kufi block text-[10px] font-bold tracking-[0.2em] text-[#9E781E] uppercase">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 w-full border border-[#C59B27]/40 bg-white px-3.5 py-2.5 text-sm text-[#0D0C0A] outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="mt-3 w-full border-2 border-[#D4AF37] bg-[#0D0C0A] py-3 text-xs font-bold font-kufi tracking-[0.2em] text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black disabled:opacity-50 shadow-md"
            >
              {authSubmitting ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO DASHBOARD'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#C59B27]/25 pt-4 text-center">
            <Link to="/" className="text-xs font-kufi font-semibold text-[#6B6256] hover:text-[#0D0C0A]">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated View (Admin Dashboard)
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8 text-[#0D0C0A]">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#C59B27]/30 pb-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-rakkas text-4xl text-[#0D0C0A]">
                Boutique Control Hub
              </h1>
              <span className="font-kufi rounded border border-[#D4AF37] bg-[#0D0C0A] px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#D4AF37]">
                AUTHENTICATED
              </span>
            </div>
            <p className="mt-1 text-xs text-[#4A433A]">
              Active session: <strong className="text-[#0D0C0A]">{adminUser?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 border-2 border-[#D4AF37] bg-[#0D0C0A] px-3.5 py-2 text-xs font-bold font-kufi text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all shadow-xs"
          >
            VIEW STORE <ExternalLink size={13} />
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 border border-[#C59B27]/40 bg-[#FAF6ED] px-4 py-2 text-xs font-semibold text-[#4A433A] hover:border-red-500 hover:text-red-600 transition-all shadow-xs"
          >
            <LogOut size={13} /> LOG OUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap border-b border-[#C59B27]/20 gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'catalog'
              ? 'border-[#C59B27] text-[#141311] bg-[#C59B27]/15'
              : 'border-transparent text-[#57524A] hover:text-[#141311]'
          }`}
        >
          <Package size={15} /> CATALOG ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'categories'
              ? 'border-[#C59B27] text-[#141311] bg-[#C59B27]/15'
              : 'border-transparent text-[#57524A] hover:text-[#141311]'
          }`}
        >
          <Sliders size={15} /> CATEGORIES ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('carousel')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'carousel'
              ? 'border-[#C59B27] text-[#141311] bg-[#C59B27]/15'
              : 'border-transparent text-[#57524A] hover:text-[#141311]'
          }`}
        >
          <Image size={15} /> HERO CAROUSEL ({slides.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'border-[#C59B27] text-[#141311] bg-[#C59B27]/15'
              : 'border-transparent text-[#57524A] hover:text-[#141311]'
          }`}
        >
          <ShoppingBag size={15} /> WHATSAPP ORDERS ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold tracking-wider transition-all ${
            activeTab === 'config'
              ? 'border-[#C59B27] text-[#141311] bg-[#C59B27]/15'
              : 'border-transparent text-[#57524A] hover:text-[#141311]'
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
              <h2 className="font-editorial text-2xl text-[#141311]">
                Fragrance Catalog
              </h2>
              <p className="text-xs text-[#57524A]">
                Manage inventory, bottle sizes, pricing, and high-resolution photography.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSeed}
                className="flex items-center gap-1.5 border border-[#C59B27]/40 bg-white px-4 py-2 text-xs font-semibold text-[#996515] hover:bg-[#C59B27] hover:text-black transition-all shadow-xs"
              >
                <Database size={14} /> SYNC ALL TO FIRESTORE
              </button>
              <button
                onClick={openNewProductModal}
                className="flex items-center gap-1.5 border border-[#141311] bg-[#141311] px-4 py-2 text-xs font-bold tracking-wider text-[#D4AF37] hover:bg-[#C59B27] hover:border-[#C59B27] hover:text-black transition-all shadow-xs"
              >
                <Plus size={15} /> ADD NEW PERFUME
              </button>
            </div>
          </div>

          {/* Product Grid / Table */}
          <div className="mt-6 overflow-x-auto border border-[#C59B27]/25 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#C59B27]/20 bg-[#F3EFE6] text-[10.5px] uppercase tracking-wider text-[#996515] font-kufi">
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
              <tbody className="divide-y divide-[#C59B27]/15">
                {products.map((p) => {
                  const selling = Number(p.sellingPrice ?? p.price) || 0;
                  const mrp = Number(p.mrp) || 0;
                  const hasDiscount = mrp > selling && selling > 0;
                  const percent = hasDiscount ? Math.round(((mrp - selling) / mrp) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-11 border border-[#C59B27]/25 bg-[#FAF7F2] object-cover"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#141311]">{p.name}</div>
                        <div className="text-[10px] text-[#78716C]">{p.notes}</div>
                      </td>
                      <td className="px-4 py-3 text-[#57524A]">{p.family}</td>
                      <td className="px-4 py-3 text-[#57524A]">{p.size}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#141311]">
                          ₹{selling.toLocaleString('en-IN')}
                        </div>
                        {hasDiscount ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10.5px] text-[#78716C] line-through">
                              ₹{mrp.toLocaleString('en-IN')}
                            </span>
                            <span className="inline-flex items-center rounded bg-emerald-700/10 border border-emerald-700/30 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                              {percent}% OFF
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#78716C]">Regular Price</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.badge && (
                          <span className="font-kufi rounded bg-[#C59B27]/15 border border-[#C59B27]/40 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#996515]">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-[#996515] hover:text-[#C59B27] transition-colors"
                            title="Edit product & pricing"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-[#78716C] hover:text-red-600 transition-colors"
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
              <h2 className="font-editorial text-2xl text-[#141311]">
                Fragrance Categories & Families
              </h2>
              <p className="text-xs text-[#57524A]">
                Create new categories to automatically enrich the Shop filter sidebar and homepage collection tiles.
              </p>
            </div>

            <button
              onClick={() => {
                setCategoryForm({ name: '', sub: '', image: '' });
                setShowCategoryModal(true);
              }}
              className="flex items-center gap-1.5 border border-[#141311] bg-[#141311] px-4 py-2 text-xs font-bold tracking-wider text-[#D4AF37] hover:bg-[#C59B27] hover:border-[#C59B27] hover:text-black transition-all shadow-xs"
            >
              <Plus size={15} /> ADD NEW CATEGORY
            </button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.id || c.name}
                className="group relative flex flex-col justify-between overflow-hidden border border-[#C59B27]/25 bg-white p-4 transition-all hover:border-[#C59B27]/60 shadow-xs"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="size-16 object-cover border border-[#C59B27]/25 bg-[#FAF7F2]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-editorial text-xl font-semibold text-[#141311]">
                      {c.name}
                    </h3>
                    <p className="text-xs text-[#57524A] font-light truncate">
                      {c.sub || 'Curated category profile'}
                    </p>
                    <span className="font-kufi text-[10px] text-[#996515] tracking-wider uppercase font-semibold">
                      {products.filter((p) => p.family?.toLowerCase() === c.name?.toLowerCase()).length} products
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end border-t border-[#C59B27]/15 pt-3">
                  <button
                    onClick={() => handleDeleteCategory(c.id || c.name.toLowerCase(), c.name)}
                    className="flex items-center gap-1 text-[11px] text-[#78716C] hover:text-red-600 transition-colors"
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
              <h2 className="font-editorial text-2xl text-[#141311]">
                Hero Banner Carousel
              </h2>
              <p className="text-xs text-[#57524A]">
                Curate homepage luxury slides, banners, promotional badges, headlines, and destination links.
              </p>
            </div>

            <button
              onClick={openNewSlideModal}
              className="flex items-center gap-1.5 border border-[#141311] bg-[#141311] px-4 py-2 text-xs font-bold tracking-wider text-[#D4AF37] hover:bg-[#C59B27] hover:border-[#C59B27] hover:text-black transition-all shadow-xs"
            >
              <Plus size={15} /> ADD NEW SLIDE
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {slides.map((s, idx) => (
              <div
                key={s.id || idx}
                className="flex flex-col md:flex-row gap-5 border border-[#C59B27]/25 bg-white p-5 shadow-sm items-center"
              >
                {/* Slide Thumbnail Preview */}
                <div className="relative w-full md:w-64 h-36 shrink-0 overflow-hidden border border-[#C59B27]/25 bg-[#FAF7F2]">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="font-kufi absolute top-2 left-2 bg-black/75 px-2 py-0.5 text-[9px] text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                    SLIDE #{idx + 1}
                  </div>
                </div>

                {/* Content details */}
                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  {s.tag && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C59B27]/40 bg-[#FAF7F2] px-3 py-0.5 text-[9.5px] font-semibold tracking-wider text-[#996515] font-kufi">
                      <Tag size={11} className="text-[#C59B27]" />
                      {s.tag}
                    </div>
                  )}

                  <h3 className="font-editorial text-2xl font-normal text-[#141311]">
                    {s.title || (
                      <span className="text-[#78716C] italic text-base">Graphic Banner (No Headline)</span>
                    )}
                  </h3>

                  {s.subtitle && (
                    <p className="font-kufi text-[11px] font-medium text-[#996515] tracking-wider uppercase">
                      {s.subtitle}
                    </p>
                  )}

                  {s.description && (
                    <p className="line-clamp-2 text-[#57524A] font-light text-[11px]">
                      {s.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5 pt-1.5 text-[11px] text-[#57524A]">
                    <span className="flex items-center gap-1 font-semibold text-[#141311]">
                      <ExternalLink size={11} className="text-[#C59B27]" />
                      Banner Click Destination:
                    </span>
                    <a
                      href={s.ctaLink || '/shop'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#996515] underline hover:text-[#C59B27] transition-colors inline-flex items-center gap-1 bg-[#F3EFE6] px-2 py-0.5 border border-[#C59B27]/30"
                    >
                      <span>{s.ctaLink || '/shop'}</span>
                      <ExternalLink size={10} />
                    </a>
                    <span className="text-[#78716C]">· Button: "{s.ctaText || 'DISCOVER'}"</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => openEditSlideModal(s)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 border border-[#C59B27]/40 bg-white px-3.5 py-2 text-xs font-semibold text-[#996515] hover:bg-[#C59B27] hover:text-black transition-all shadow-xs"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCarouselSlide(s.id, s.title)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 border border-[#D9C8A9] bg-white px-3.5 py-2 text-xs font-semibold text-[#78716C] hover:border-red-500 hover:text-red-600 transition-all shadow-xs"
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
              <h2 className="font-editorial text-2xl text-[#141311]">
                Customer WhatsApp Orders
              </h2>
              <p className="text-xs text-[#57524A]">
                Logged orders initiated by customers via the WhatsApp checkout flow.
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-1.5 border border-[#C59B27]/30 bg-white px-3.5 py-1.5 text-xs text-[#996515] hover:bg-[#C59B27] hover:text-black transition-all shadow-xs"
            >
              <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} /> REFRESH
            </button>
          </div>

          {ordersLoading ? (
            <div className="py-16 text-center text-xs text-[#78716C]">
              Fetching real-time orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 border border-dashed border-[#C59B27]/30 bg-white p-12 text-center shadow-xs">
              <ShoppingBag className="mx-auto mb-2 text-[#C59B27]" size={28} />
              <p className="text-sm font-semibold text-[#141311]">No customer orders recorded yet</p>
              <p className="mt-1 text-xs text-[#57524A]">
                When customers click "ORDER VIA WHATSAPP", order logs will synchronize here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId || order.id}
                  className="border border-[#C59B27]/25 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C59B27]/15 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-editorial text-xl font-bold text-[#996515]">
                        #{order.orderId || order.id}
                      </span>
                      <span className="rounded-full bg-emerald-700/10 border border-emerald-700/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Redirected to WhatsApp
                      </span>
                    </div>
                    <div className="text-xs text-[#78716C]">
                      {order.createdAtIso
                        ? new Date(order.createdAtIso).toLocaleString()
                        : 'Recent'}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-kufi mb-2 text-[10px] uppercase tracking-wider text-[#996515] font-semibold">
                        Ordered Items
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#57524A]">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>
                              {item.name} ({item.size}) × {item.quantity}
                            </span>
                            <span className="font-semibold text-[#141311]">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-[#C59B27]/15 pt-2 text-xs font-bold text-[#141311]">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-xs text-[#57524A] space-y-1">
                      <p className="font-kufi mb-2 text-[10px] uppercase tracking-wider text-[#996515] font-semibold">
                        Customer Context
                      </p>
                      {order.customerName && (
                        <p>
                          <strong className="text-[#141311]">Name:</strong> {order.customerName}
                        </p>
                      )}
                      {order.notes && (
                        <p>
                          <strong className="text-[#141311]">Delivery City / Notes:</strong> {order.notes}
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
          <h2 className="font-editorial text-2xl text-[#141311]">
            Backend Status & Configuration
          </h2>
          <div className="mt-4 divide-y divide-[#C59B27]/15 border border-[#C59B27]/25 bg-white p-5 text-xs shadow-sm">
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-[#57524A]">Firebase Connection:</span>
              <span
                className={
                  isFirebaseConfigured
                    ? 'font-bold text-emerald-700'
                    : 'font-bold text-amber-600'
                }
              >
                {isFirebaseConfigured
                  ? 'Connected (Live Firestore & Storage)'
                  : 'Unconfigured (Local Catalog Fallback)'}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-[#57524A]">Firestore Database:</span>
              <span className="text-[#141311] font-medium">{isFirebaseConfigured ? 'Ready' : 'Mock/Local'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-[#57524A]">Storage Bucket:</span>
              <span className="text-[#141311] font-medium">{isFirebaseConfigured ? 'Live Storage Active' : 'Offline Mode'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="font-semibold text-[#57524A]">Owner WhatsApp Target:</span>
              <span className="font-mono text-[#996515] font-bold">
                +{getWhatsAppNumber()}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* MODAL 1: ADD OR EDIT PRODUCT (WITH MRP & SELLING PRICE) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#C59B27]/30 bg-white p-6 shadow-2xl text-[#141311]">
            <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#141311]">
                  {editingProductId ? 'Edit Fragrance & Pricing' : 'Add New Fragrance'}
                </h3>
                <p className="text-xs text-[#57524A]">
                  Configure MRP (slashed) and Selling Price (discounted with green sale tag)
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#78716C] hover:text-[#141311]"
              >
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 border border-emerald-700/30 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle size={16} />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  PERFUME NAME *
                </label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g. Royal Oud Extrait"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              {/* TWO PRICING OPTIONS: MRP (SLASHED) & SELLING PRICE (DISCOUNTED) */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                    MRP (₹) — MAXIMUM RETAIL PRICE
                  </label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) =>
                      setProductForm({ ...productForm, mrp: e.target.value })
                    }
                    placeholder="e.g. 4999 (Shown slashed)"
                    className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#78716C]">
                    Original retail price (displayed with a strikethrough).
                  </p>
                </div>

                <div>
                  <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px] flex items-center justify-between">
                    <span>SELLING PRICE (₹) *</span>
                    {productForm.mrp && Number(productForm.mrp) > Number(productForm.price) && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-700/10 border border-emerald-700/30 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-700">
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
                    className="mt-1 w-full border border-[#C59B27]/50 bg-[#FAF7F2] p-2.5 text-[#141311] font-semibold focus:border-[#C59B27] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#78716C]">
                    Discounted selling price (shown with green sale tag).
                  </p>
                </div>
              </div>

              {/* Live Discount Summary if MRP > Selling Price */}
              {productForm.mrp && Number(productForm.mrp) > Number(productForm.price) && (
                <div className="flex items-center gap-2 border border-emerald-700/30 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 rounded">
                  <span className="font-bold">🏷️ Green Sale Tag Preview:</span>
                  <span>
                    MRP <span className="line-through">₹{Number(productForm.mrp).toLocaleString('en-IN')}</span> → Selling Price ₹{Number(productForm.price).toLocaleString('en-IN')} (Save ₹{(Number(productForm.mrp) - Number(productForm.price)).toLocaleString('en-IN')} · {Math.round(((Number(productForm.mrp) - Number(productForm.price)) / Number(productForm.mrp)) * 100)}% OFF)
                  </span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                    FRAGRANCE FAMILY
                  </label>
                  <select
                    value={productForm.family}
                    onChange={(e) =>
                      setProductForm({ ...productForm, family: e.target.value })
                    }
                    className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
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
                    className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                    BOTTLE SIZE
                  </label>
                  <input
                    value={productForm.size}
                    onChange={(e) =>
                      setProductForm({ ...productForm, size: e.target.value })
                    }
                    placeholder="50 ml / 12 ml Attar"
                    className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  SCENT NOTES
                </label>
                <input
                  value={productForm.notes}
                  onChange={(e) =>
                    setProductForm({ ...productForm, notes: e.target.value })
                  }
                  placeholder="e.g. Saffron · Cambodian Oud · Ambergris"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  BADGE (OPTIONAL)
                </label>
                <input
                  value={productForm.badge}
                  onChange={(e) =>
                    setProductForm({ ...productForm, badge: e.target.value })
                  }
                  placeholder="Bestseller / Royal Reserve / Limited"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
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
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              {/* IMAGE UPLOAD */}
              <div className="border border-dashed border-[#C59B27]/40 p-4 bg-[#FAF7F2]">
                <label className="font-kufi block font-bold text-[#996515] uppercase text-[10px]">
                  PRODUCT PHOTO
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 w-full text-xs text-[#57524A] file:mr-3 file:border file:border-[#C59B27]/40 file:bg-white file:px-3 file:py-1.5 file:text-xs file:text-[#996515] file:cursor-pointer shadow-xs"
                />

                {imagePreview ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-16 object-cover border border-[#C59B27]/30"
                    />
                    <span className="text-[11px] text-[#996515] font-semibold">
                      Photo ready for upload
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-[#78716C]">
                    Or specify an existing image URL:
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full border border-[#D9C8A9] bg-white p-2 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#C59B27]/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-[#D9C8A9] bg-white px-4 py-2.5 text-xs font-semibold text-[#57524A] hover:text-[#141311]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="border border-[#141311] bg-[#141311] px-6 py-2.5 text-xs font-bold tracking-wider text-[#D4AF37] hover:bg-[#C59B27] hover:border-[#C59B27] hover:text-black disabled:opacity-50 transition-all shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md border border-[#C59B27]/30 bg-white p-6 shadow-2xl text-[#141311]">
            <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#141311]">
                  Add Fragrance Category
                </h3>
                <p className="text-xs text-[#57524A]">
                  Adds a new family filter to the store and category showcase
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-[#78716C] hover:text-[#141311]"
              >
                ✕
              </button>
            </div>

            {categorySuccess && (
              <div className="mt-4 flex items-center gap-2 border border-emerald-700/30 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle size={16} />
                <span>{categorySuccess}</span>
              </div>
            )}

            {categoryError && (
              <div className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} />
                <span>{categoryError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  CATEGORY NAME *
                </label>
                <input
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="e.g. Attars, Bakhoor, Oriental"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  SUBTITLE / NOTES (OPTIONAL)
                </label>
                <input
                  value={categoryForm.sub}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, sub: e.target.value })
                  }
                  placeholder="e.g. Pure Concentrated Oil · Alcohol-Free"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  COVER PHOTO URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#78716C]">
                  If left blank, an elegant default perfume photography cover will be applied.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#C59B27]/15">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="border border-[#D9C8A9] bg-white px-4 py-2.5 text-xs font-semibold text-[#57524A] hover:text-[#141311]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="border border-[#141311] bg-[#141311] px-6 py-2.5 text-xs font-bold tracking-wider text-[#D4AF37] hover:bg-[#C59B27] hover:border-[#C59B27] hover:text-black disabled:opacity-50 transition-all shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#C59B27]/30 bg-white p-6 shadow-2xl text-[#141311]">
            <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#141311]">
                  {editingSlideId ? 'Edit Carousel Slide' : 'Publish New Carousel Slide'}
                </h3>
                <p className="text-xs text-[#57524A]">
                  Manage high-resolution banner visuals, promotional discounts, and headlines
                </p>
              </div>
              <button
                onClick={() => setShowCarouselModal(false)}
                className="text-[#78716C] hover:text-[#141311]"
              >
                ✕
              </button>
            </div>

            {carouselSuccess && (
              <div className="mt-4 flex items-center gap-2 border border-emerald-700/30 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle size={16} />
                <span>{carouselSuccess}</span>
              </div>
            )}

            {carouselError && (
              <div className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} />
                <span>{carouselError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCarouselSlide} className="mt-4 space-y-4 text-xs">
              {/* EDITABLE PROMOTIONAL TAG / BADGE */}
              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px] flex items-center gap-1.5">
                  <Tag size={12} /> PROMOTIONAL TAG / BADGE
                </label>
                <input
                  value={carouselForm.tag}
                  onChange={(e) =>
                    setCarouselForm({ ...carouselForm, tag: e.target.value })
                  }
                  placeholder="e.g. FESTIVE OFFER · UP TO 40% OFF / LIMITED ARCHIVE"
                  className="mt-1 w-full border border-[#C59B27]/40 bg-[#FAF7F2] p-2.5 text-[#996515] font-semibold focus:border-[#C59B27] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#78716C]">
                  This tag appears with a golden sparkle badge atop the slide title.
                </p>
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  SLIDE HEADLINE / TITLE (OPTIONAL)
                </label>
                <input
                  value={carouselForm.title}
                  onChange={(e) =>
                    setCarouselForm({ ...carouselForm, title: e.target.value })
                  }
                  placeholder="e.g. The Sovereign Oud Collection (Leave blank for graphic banner)"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
                  SUBTITLE / EYEBROW
                </label>
                <input
                  value={carouselForm.subtitle}
                  onChange={(e) =>
                    setCarouselForm({ ...carouselForm, subtitle: e.target.value })
                  }
                  placeholder="e.g. 100% Alcohol-Free Concentrated Oil Nectar"
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-kufi block font-bold tracking-wider text-[#996515] uppercase text-[10px]">
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
                  className="mt-1 w-full border border-[#D9C8A9] bg-[#FAF7F2] p-2.5 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              {/* BANNER REDIRECT LINK & PRESET SELECTOR */}
              <div className="border border-[#C59B27]/30 bg-[#FAF7F2] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-kufi font-bold tracking-wider text-[#996515] uppercase text-[10px] flex items-center gap-1.5">
                    <ExternalLink size={12} /> BANNER CLICK REDIRECT DESTINATION (WHERE BANNER LINKS TO)
                  </label>
                  {carouselForm.ctaLink && (
                    <a
                      href={carouselForm.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-[#996515] hover:underline flex items-center gap-1"
                    >
                      Test Link ↗
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-[#57524A] font-light">
                  When a customer clicks anywhere on this hero banner, they will be instantly redirected to this product, category, or promotional offer URL.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="font-kufi block text-[10px] font-semibold text-[#57524A] uppercase mb-1">
                      REDIRECT URL OR PATH
                    </label>
                    <input
                      required
                      value={carouselForm.ctaLink}
                      onChange={(e) =>
                        setCarouselForm({ ...carouselForm, ctaLink: e.target.value })
                      }
                      placeholder="e.g. /product/oud-royale or /shop?family=Perfume"
                      className="w-full border border-[#D9C8A9] bg-white p-2.5 text-[#141311] font-mono text-xs focus:border-[#C59B27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-kufi block text-[10px] font-semibold text-[#57524A] uppercase mb-1">
                      OPTIONAL BUTTON CTA TEXT
                    </label>
                    <input
                      value={carouselForm.ctaText}
                      onChange={(e) =>
                        setCarouselForm({ ...carouselForm, ctaText: e.target.value })
                      }
                      placeholder="e.g. EXPLORE THIS OFFER"
                      className="w-full border border-[#D9C8A9] bg-white p-2.5 text-[#141311] text-xs focus:border-[#C59B27] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Destination Selectors */}
                <div className="space-y-2 pt-2 border-t border-[#C59B27]/20">
                  <p className="font-kufi text-[10px] font-semibold text-[#996515] uppercase tracking-wider">
                    Quick Select Destination:
                  </p>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {/* 1. Specific Product Dropdown */}
                    <div>
                      <span className="text-[10px] text-[#57524A] block mb-1">Redirect to Specific Product:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedProd = products.find((p) => p.id === e.target.value);
                            setCarouselForm({
                              ...carouselForm,
                              ctaLink: `/product/${e.target.value}`,
                              ctaText: selectedProd ? `SHOP ${selectedProd.name.toUpperCase()}` : carouselForm.ctaText,
                            });
                          }
                        }}
                        className="w-full border border-[#D9C8A9] bg-white p-2 text-xs text-[#141311] focus:border-[#C59B27] focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select a Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.family}) — ₹{p.sellingPrice || p.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Store Category Dropdown */}
                    <div>
                      <span className="text-[10px] text-[#57524A] block mb-1">Redirect to Store Category:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setCarouselForm({
                              ...carouselForm,
                              ctaLink: `/shop?family=${encodeURIComponent(e.target.value)}`,
                              ctaText: `EXPLORE ${e.target.value.toUpperCase()}`,
                            });
                          }
                        }}
                        className="w-full border border-[#D9C8A9] bg-white p-2 text-xs text-[#141311] focus:border-[#C59B27] focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select a Category --</option>
                        {categories.map((c) => (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name.charAt(0).toUpperCase() + c.name.slice(1)} Collection
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick Preset Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#78716C] mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setCarouselForm({ ...carouselForm, ctaLink: '/shop', ctaText: 'VIEW ALL CATALOG' })}
                      className="px-2 py-0.5 rounded bg-white border border-[#D9C8A9] text-[10px] text-[#57524A] hover:bg-[#C59B27] hover:text-black hover:border-[#C59B27] transition-colors shadow-xs"
                    >
                      All Shop (/shop)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarouselForm({ ...carouselForm, ctaLink: '/#bestsellers', ctaText: 'VIEW BESTSELLERS' })}
                      className="px-2 py-0.5 rounded bg-white border border-[#D9C8A9] text-[10px] text-[#57524A] hover:bg-[#C59B27] hover:text-black hover:border-[#C59B27] transition-colors shadow-xs"
                    >
                      Bestsellers (/#bestsellers)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarouselForm({ ...carouselForm, ctaLink: '/#collections', ctaText: 'EXPLORE COLLECTIONS' })}
                      className="px-2 py-0.5 rounded bg-white border border-[#D9C8A9] text-[10px] text-[#57524A] hover:bg-[#C59B27] hover:text-black hover:border-[#C59B27] transition-colors shadow-xs"
                    >
                      Collections (/#collections)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarouselForm({ ...carouselForm, ctaLink: '/#story', ctaText: 'OUR STORY' })}
                      className="px-2 py-0.5 rounded bg-white border border-[#D9C8A9] text-[10px] text-[#57524A] hover:bg-[#C59B27] hover:text-black hover:border-[#C59B27] transition-colors shadow-xs"
                    >
                      Our Story (/#story)
                    </button>
                  </div>
                </div>
              </div>

              {/* CAROUSEL BANNER PHOTO */}
              <div className="border border-dashed border-[#C59B27]/40 p-4 bg-[#FAF7F2]">
                <label className="font-kufi block font-bold text-[#996515] uppercase text-[10px]">
                  CAROUSEL BANNER PHOTO
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCarouselImageChange}
                  className="mt-2 w-full text-xs text-[#57524A] file:mr-3 file:border file:border-[#C59B27]/40 file:bg-white file:px-3 file:py-1.5 file:text-xs file:text-[#996515] file:cursor-pointer shadow-xs"
                />

                {carouselImagePreview ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={carouselImagePreview}
                      alt="Banner Preview"
                      className="h-16 w-32 object-cover border border-[#C59B27]/30"
                    />
                    <span className="text-[11px] text-[#996515] font-semibold">
                      Banner image ready
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-[#78716C]">
                    Or specify an existing image URL:
                    <input
                      type="url"
                      value={carouselForm.image}
                      onChange={(e) =>
                        setCarouselForm({ ...carouselForm, image: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="mt-1 w-full border border-[#D9C8A9] bg-white p-2 text-[#141311] focus:border-[#C59B27] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#C59B27]/15">
                <button
                  type="button"
                  onClick={() => setShowCarouselModal(false)}
                  className="border border-[#D9C8A9] bg-white px-4 py-2.5 text-xs font-semibold text-[#57524A] hover:text-[#141311]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={carouselLoading}
                  className="border border-[#141311] bg-[#141311] px-6 py-2.5 text-xs font-bold tracking-wider text-[#D4AF37] hover:bg-[#C59B27] hover:border-[#C59B27] hover:text-black disabled:opacity-50 transition-all shadow-xs"
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
