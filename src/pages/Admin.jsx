import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  Package,
  ShoppingBag,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { fetchOrders } from '../services/ordersService';
import { isFirebaseConfigured } from '../firebase/config';
import { getWhatsAppNumber } from '../services/whatsappService';

export default function Admin() {
  const { adminUser, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const { products, addProduct, removeProduct, seedCatalog, refreshProducts } = useProducts();

  // Tab navigation: 'catalog' | 'orders' | 'config'
  const [activeTab, setActiveTab] = useState('catalog');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // New Product Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    concentration: 'Eau de Parfum',
    family: 'Woody',
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
      setAuthError(err.message || 'Invalid email or password. Please try again.');
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      if (!productForm.name || !productForm.price) {
        throw new Error('Please fill in product name and price.');
      }

      await addProduct(productForm, imageFile);
      setFormSuccess('Product saved successfully to Firestore & Storage!');

      // Reset form
      setProductForm({
        name: '',
        price: '',
        concentration: 'Eau de Parfum',
        family: 'Woody',
        size: '50 ml',
        notes: '',
        badge: '',
        description: '',
        image: '',
      });
      setImageFile(null);
      setImagePreview('');

      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
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

  const handleSeed = async () => {
    if (
      window.confirm(
        'Seed sample catalog to Firestore? This will populate the collection with initial perfumes.'
      )
    ) {
      try {
        await seedCatalog();
        alert('Sample catalog successfully seeded to Firestore!');
      } catch (err) {
        alert('Failed to seed catalog: ' + err.message);
      }
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#581F2A]">
          <RefreshCw className="animate-spin" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated View (Login Screen)
  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-12">
        <div className="border border-[#D9CBBB] bg-[#F7F1E8] p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#581F2A] text-[#F7F1E8]">
              <Lock size={20} />
            </div>
            <h1 className="font-editorial text-3xl font-semibold text-[#581F2A]">
              Admin Portal
            </h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-[#8C7044]">
              I.K.K Perfume Management
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mt-6 flex items-start gap-2 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <div>
                <strong>Firebase keys not yet set in .env.</strong> To sign in,
                add your Firebase project credentials to <code className="bg-amber-100 px-1">.env</code> and enable Email/Password authentication in the Firebase Console.
              </div>
            </div>
          )}

          {authError && (
            <div className="mt-6 flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#581F2A]">
                ADMIN EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ikkperfume.com"
                className="mt-1.5 w-full border border-[#D9CBBB] bg-white px-3 py-2.5 text-sm outline-[#581F2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#581F2A]">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 w-full border border-[#D9CBBB] bg-white px-3 py-2.5 text-sm outline-[#581F2A]"
              />
              <p className="mt-1 text-[11px] text-[#75665A]">
                Encrypted via TLS & salted using Firebase scrypt hashing.
              </p>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="mt-2 w-full bg-[#581F2A] py-3 text-xs font-semibold tracking-widest text-white transition-opacity disabled:opacity-50"
            >
              {authSubmitting ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO DASHBOARD'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#D9CBBB] pt-4 text-center">
            <Link to="/" className="text-xs text-[#75665A] hover:text-[#581F2A]">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated View (Admin Dashboard)
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9CBBB] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-4xl text-[#581F2A]">
              Owner Dashboard
            </h1>
            <span className="rounded bg-[#581F2A]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#581F2A]">
              AUTHENTICATED
            </span>
          </div>
          <p className="mt-1 text-xs text-[#75665A]">
            Logged in as <strong className="text-[#29211F]">{adminUser?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1 border border-[#D9CBBB] px-3 py-2 text-xs font-semibold text-[#581F2A] hover:bg-[#E9DED0]"
          >
            VIEW STORE <ExternalLink size={13} />
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1 bg-[#29211F] px-4 py-2 text-xs font-semibold text-white hover:bg-black"
          >
            <LogOut size={13} /> LOG OUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-[#D9CBBB]">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold tracking-wider ${
            activeTab === 'catalog'
              ? 'border-[#581F2A] text-[#581F2A]'
              : 'border-transparent text-[#75665A] hover:text-[#581F2A]'
          }`}
        >
          <Package size={15} /> CATALOG ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold tracking-wider ${
            activeTab === 'orders'
              ? 'border-[#581F2A] text-[#581F2A]'
              : 'border-transparent text-[#75665A] hover:text-[#581F2A]'
          }`}
        >
          <ShoppingBag size={15} /> WHATSAPP ORDERS
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold tracking-wider ${
            activeTab === 'config'
              ? 'border-[#581F2A] text-[#581F2A]'
              : 'border-transparent text-[#75665A] hover:text-[#581F2A]'
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
              <h2 className="font-editorial text-2xl text-[#581F2A]">
                Perfume Inventory
              </h2>
              <p className="text-xs text-[#75665A]">
                Manage fragrances stored in Cloud Firestore & product photos in Firebase Storage.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSeed}
                className="flex items-center gap-1.5 border border-[#8C7044] px-4 py-2 text-xs font-semibold text-[#8C7044] hover:bg-[#8C7044] hover:text-white"
              >
                <Database size={14} /> SEED DEMO CATALOG
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-[#581F2A] px-4 py-2 text-xs font-semibold tracking-wider text-white hover:bg-[#3f151d]"
              >
                <Plus size={15} /> ADD NEW PERFUME
              </button>
            </div>
          </div>

          {/* Product Grid / Table */}
          <div className="mt-6 overflow-x-auto border border-[#D9CBBB] bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D9CBBB] bg-[#F7F1E8] text-[11px] uppercase tracking-wider text-[#8C7044]">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Family</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DED0]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-10 bg-[#E9DED0] object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#581F2A]">{p.name}</div>
                      <div className="text-[10px] text-[#75665A]">{p.notes}</div>
                    </td>
                    <td className="px-4 py-3">{p.family}</td>
                    <td className="px-4 py-3">{p.size}</td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      {p.badge && (
                        <span className="bg-[#E9DED0] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#581F2A]">
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="text-red-700 hover:text-red-900"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-2xl text-[#581F2A]">
                Customer Orders
              </h2>
              <p className="text-xs text-[#75665A]">
                Orders placed via WhatsApp checkout and recorded in Firestore.
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-1 border border-[#D9CBBB] px-3 py-1.5 text-xs text-[#581F2A] hover:bg-[#E9DED0]"
            >
              <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} /> REFRESH
            </button>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-xs text-[#75665A]">
              Loading orders from Cloud Firestore...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 border border-dashed border-[#D9CBBB] p-12 text-center">
              <ShoppingBag className="mx-auto mb-2 text-[#8C7044]" size={28} />
              <p className="text-sm font-semibold text-[#581F2A]">No orders recorded yet</p>
              <p className="mt-1 text-xs text-[#75665A]">
                When customers check out via WhatsApp, their order reference and item details will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId || order.id}
                  className="border border-[#D9CBBB] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9DED0] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-editorial text-xl font-semibold text-[#581F2A]">
                        #{order.orderId || order.id}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Redirected to WhatsApp
                      </span>
                    </div>
                    <div className="text-xs text-[#75665A]">
                      {order.createdAtIso
                        ? new Date(order.createdAtIso).toLocaleString()
                        : 'Recent'}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-[#8C7044]">
                        Ordered Fragrances
                      </p>
                      <ul className="space-y-1 text-xs">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-[#29211F]">
                            <span>
                              {item.name} ({item.size}) × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-[#E9DED0] pt-2 text-xs font-bold text-[#581F2A]">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-xs text-[#75665A]">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-[#8C7044]">
                        Customer Information
                      </p>
                      {order.customerName && (
                        <p>
                          <strong>Name:</strong> {order.customerName}
                        </p>
                      )}
                      {order.notes && (
                        <p className="mt-1">
                          <strong>Address/Notes:</strong> {order.notes}
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

      {/* TAB 3: BACKEND CONFIG & STATUS */}
      {activeTab === 'config' && (
        <section className="mt-8 max-w-2xl">
          <h2 className="font-editorial text-2xl text-[#581F2A]">
            Backend Status & Settings
          </h2>
          <div className="mt-4 divide-y divide-[#E9DED0] border border-[#D9CBBB] bg-white p-5 text-xs">
            <div className="flex justify-between py-2">
              <span className="font-semibold">Firebase Status:</span>
              <span
                className={
                  isFirebaseConfigured
                    ? 'font-semibold text-emerald-700'
                    : 'font-semibold text-amber-700'
                }
              >
                {isFirebaseConfigured
                  ? 'Connected (Live)'
                  : 'Unconfigured (Local Catalog Fallback)'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Firestore Database:</span>
              <span>{isFirebaseConfigured ? 'Ready' : 'Mock/Local'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Firebase Storage:</span>
              <span>{isFirebaseConfigured ? 'Ready for uploads' : 'Unconfigured'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Owner WhatsApp Number:</span>
              <span className="font-mono text-[#581F2A]">
                +{getWhatsAppNumber()}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ADD NEW PRODUCT MODAL (WITH FIREBASE STORAGE IMAGE UPLOAD) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#D9CBBB] bg-[#F7F1E8] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9CBBB] pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#581F2A]">
                  Add New Fragrance
                </h3>
                <p className="text-xs text-[#75665A]">
                  Save to Firestore with image hosted in Firebase Storage
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm font-semibold hover:text-[#581F2A]"
              >
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle size={16} />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-semibold text-[#581F2A]">
                    PERFUME NAME *
                  </label>
                  <input
                    required
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    placeholder="e.g. Royal Amber"
                    className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#581F2A]">
                    PRICE (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    placeholder="3499"
                    className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block font-semibold text-[#581F2A]">
                    FRAGRANCE FAMILY
                  </label>
                  <select
                    value={productForm.family}
                    onChange={(e) =>
                      setProductForm({ ...productForm, family: e.target.value })
                    }
                    className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                  >
                    <option value="Woody">Woody</option>
                    <option value="Floral">Floral</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Oud">Oud</option>
                    <option value="Oriental">Oriental</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#581F2A]">
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
                    placeholder="Eau de Parfum"
                    className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#581F2A]">
                    BOTTLE SIZE
                  </label>
                  <input
                    value={productForm.size}
                    onChange={(e) =>
                      setProductForm({ ...productForm, size: e.target.value })
                    }
                    placeholder="50 ml"
                    className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#581F2A]">
                  SCENT NOTES
                </label>
                <input
                  value={productForm.notes}
                  onChange={(e) =>
                    setProductForm({ ...productForm, notes: e.target.value })
                  }
                  placeholder="e.g. Saffron · Amberwood · Cedar"
                  className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#581F2A]">
                  BADGE (OPTIONAL)
                </label>
                <input
                  value={productForm.badge}
                  onChange={(e) =>
                    setProductForm({ ...productForm, badge: e.target.value })
                  }
                  placeholder="Bestseller / New Arrival / Limited"
                  className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#581F2A]">
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
                  className="mt-1 w-full border border-[#D9CBBB] bg-white p-2.5 outline-[#581F2A]"
                />
              </div>

              {/* IMAGE UPLOAD TO FIREBASE STORAGE */}
              <div className="border border-dashed border-[#8C7044] p-4 bg-white/60">
                <label className="block font-semibold text-[#581F2A]">
                  PRODUCT PHOTO (FIREBASE STORAGE)
                </label>
                <p className="text-[11px] text-[#75665A] mb-2">
                  Select an image file to upload directly to Firebase Storage bucket.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 w-full text-xs"
                />

                {imagePreview ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-16 object-cover border border-[#D9CBBB]"
                    />
                    <span className="text-[11px] text-[#8C7044]">
                      Ready to upload on save
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-[#75665A]">
                    Or provide an existing image URL:
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image: e.target.value })
                      }
                      placeholder="https://..."
                      className="mt-1 w-full border border-[#D9CBBB] bg-white p-2 outline-[#581F2A]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D9CBBB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-[#D9CBBB] px-4 py-2.5 text-xs font-semibold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-[#581F2A] px-6 py-2.5 text-xs font-semibold tracking-wider text-white disabled:opacity-50"
                >
                  {formLoading ? 'UPLOADING & SAVING...' : 'SAVE PERFUME'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
