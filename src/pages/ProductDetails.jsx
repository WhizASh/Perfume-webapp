import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MessageCircle,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  Tag,
  ChevronLeft,
  ChevronRight,
  Play,
  Maximize2,
  X,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import WhatsAppOrderModal from '../components/WhatsAppOrderModal';
import {
  getProductDiscount,
  getProductMedia,
  parseVideoUrl,
} from '../services/productsService';

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Variants state
  const variants = Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants : [];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // Multiple photos & video gallery state
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset active media & selected variant index when viewing a different product
  useEffect(() => {
    setActiveMediaIndex(0);
    setLightboxOpen(false);
    setSelectedVariantIndex(0);
  }, [id]);

  const selectedVariant = variants[selectedVariantIndex] || variants[0] || null;

  // Active pricing calculation (matching selected variant or base product)
  const currentSellingPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product?.price) || 0;

  const currentMrp = selectedVariant
    ? (selectedVariant.mrp !== undefined && selectedVariant.mrp !== null && selectedVariant.mrp !== ''
        ? Number(selectedVariant.mrp)
        : currentSellingPrice)
    : (product?.mrp !== undefined && product?.mrp !== null && product?.mrp !== ''
        ? Number(product.mrp)
        : currentSellingPrice);

  const hasDiscount = currentMrp > currentSellingPrice && currentSellingPrice > 0;
  const savings = hasDiscount ? currentMrp - currentSellingPrice : 0;
  const percent = hasDiscount ? Math.round((savings / currentMrp) * 100) : 0;

  const mediaItems = product ? getProductMedia(product) : [];
  const activeItem = mediaItems[activeMediaIndex] || mediaItems[0] || (product?.image ? { type: 'image', url: product.image } : null);
  const videoDetails = activeItem?.type === 'video' ? parseVideoUrl(activeItem.url) : null;

  const handlePrevMedia = () => {
    if (mediaItems.length <= 1) return;
    setActiveMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handleNextMedia = () => {
    if (mediaItems.length <= 1) return;
    setActiveMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  // Keyboard navigation & body scroll lock for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'ArrowRight') handleNextMedia();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, mediaItems.length]);

  if (loading && !product) {
    return (
      <div className="px-6 py-24 text-center text-xs text-[#78716C]">
        Loading royal fragrance specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#141311]">
          Fragrance Not Found
        </h1>
        <Link to="/shop" className="mt-4 inline-block text-xs font-semibold tracking-wider text-[#996515] underline">
          Return to All Fragrances
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      selectedVariant,
      price: currentSellingPrice,
      sellingPrice: currentSellingPrice,
      mrp: currentMrp,
      size: selectedVariant ? selectedVariant.name : product.size,
      cartItemId: selectedVariant ? `${product.id}-${selectedVariant.name}` : product.id,
      quantity: qty,
    };
    onAddToCart(itemToAdd);
  };

  const itemToOrder = product
    ? {
        ...product,
        selectedVariant,
        price: currentSellingPrice,
        sellingPrice: currentSellingPrice,
        mrp: currentMrp,
        size: selectedVariant ? selectedVariant.name : product.size,
        cartItemId: selectedVariant ? `${product.id}-${selectedVariant.name}` : product.id,
        quantity: qty,
      }
    : null;

  const handleDirectWhatsAppOrder = () => {
    setShowOrderModal(true);
  };

  const relatedProducts = products
    .filter((p) => p.id !== id)
    .slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-12 text-[#141311]">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-8 text-xs text-[#78716C] flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Link to="/shop" className="hover:text-[#C59B27] transition-colors">
          Fragrances
        </Link>
        <span>/</span>
        <span className="text-[#9E781E] font-medium">{product.family}</span>
        <span>/</span>
        <span className="text-[#141311] font-semibold truncate max-w-[180px] sm:max-w-none">{product.name}</span>
      </div>

      {/* Product Details Section */}
      <div className="grid gap-6 sm:gap-10 md:grid-cols-2 lg:gap-16 items-start">
        {/* Product Media Gallery (Multiple Photos & Video) */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Media Frame */}
          <div className="relative overflow-hidden border-2 border-[#C59B27]/40 bg-[#0D0C0A] p-2 sm:p-2.5 shadow-[0_10px_35px_rgba(212,175,55,0.2)] group">
            {/* Viewport Box */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-black flex items-center justify-center">
              {activeItem?.type === 'video' ? (
                videoDetails?.type === 'youtube' ? (
                  <iframe
                    src={videoDetails.embedUrl}
                    title={`${product.name} Video Showcase`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <video
                    key={activeItem.url}
                    src={activeItem.url}
                    poster={activeItem.poster || product.image}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <img
                  src={activeItem?.url || product.image}
                  alt={activeItem?.title || product.name}
                  onClick={() => setLightboxOpen(true)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                />
              )}

              {/* Discount / Sale Tag */}
              {hasDiscount && (
                <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded bg-[#0D0C0A] border border-emerald-500 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 shadow-xl">
                    <Tag size={11} className="stroke-[2.5]" /> SALE {percent}% OFF
                  </span>
                </div>
              )}

              {/* Media Type & Counter Badge */}
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0C0A]/85 backdrop-blur-sm border border-[#D4AF37]/50 px-2.5 py-1 text-[10px] sm:text-[11px] font-kufi font-bold uppercase tracking-wider text-[#D4AF37] shadow-lg">
                  {activeItem?.type === 'video' ? (
                    <>
                      <Film size={12} className="text-[#D4AF37]" />
                      <span>CINEMA VIDEO</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={12} className="text-[#D4AF37]" />
                      <span>{activeMediaIndex + 1} / {mediaItems.length}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Left / Right Arrow Buttons (when > 1 media items) */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMedia();
                    }}
                    aria-label="Previous image or video"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex size-9 sm:size-10 items-center justify-center rounded-full bg-[#0D0C0A]/75 border border-[#D4AF37]/60 text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black hover:scale-110 shadow-lg cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMedia();
                    }}
                    aria-label="Next image or video"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex size-9 sm:size-10 items-center justify-center rounded-full bg-[#0D0C0A]/75 border border-[#D4AF37]/60 text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black hover:scale-110 shadow-lg cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Fullscreen / Lightbox Zoom Button on bottom right */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open fullscreen gallery"
                className="absolute bottom-3 right-3 z-10 flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#0D0C0A]/75 border border-[#D4AF37]/60 text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black hover:scale-110 shadow-lg cursor-pointer"
                title="View Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Horizontal Thumbnails Strip (when > 1 media items) */}
          {mediaItems.length > 1 && (
            <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              {mediaItems.map((item, idx) => {
                const isActive = idx === activeMediaIndex;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative size-16 sm:size-20 shrink-0 overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-102'
                        : 'border-[#C59B27]/30 opacity-70 hover:opacity-100 hover:border-[#D4AF37]/70'
                    } bg-[#0D0C0A]`}
                    aria-label={`View ${item.type === 'video' ? 'video' : `photo ${idx + 1}`}`}
                  >
                    <img
                      src={item.type === 'video' ? (item.poster || product.image) : item.url}
                      alt={item.title || `${product.name} thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-0.5 text-[#D4AF37]">
                        <Play size={14} className="fill-[#D4AF37] stroke-[#0D0C0A]" />
                        <span className="font-kufi text-[8px] font-bold tracking-wider">VIDEO</span>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-[#D4AF37]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <p className="font-kufi text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#9E781E]">
              {product.concentration} · {selectedVariant ? selectedVariant.name : product.size} · {product.family}
            </p>
          </div>

          <h1 className="mt-2 sm:mt-3 font-rakkas text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-[#0D0C0A]">
            {product.name}
          </h1>

          <p className="font-messiri mt-1.5 sm:mt-2 text-sm sm:text-base text-[#9E781E] font-semibold tracking-wide">
            {product.notes}
          </p>

          {/* Pricing: Discounted Selling Price, Slashed MRP, and Green Sale Tag */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0D0C0A]">
              ₹{currentSellingPrice.toLocaleString('en-IN')}
            </span>

            {hasDiscount && (
              <span className="text-base sm:text-lg text-[#6B6256] line-through decoration-[#8C8376]">
                MRP: ₹{currentMrp.toLocaleString('en-IN')}
              </span>
            )}

            {hasDiscount && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0C0A] border border-emerald-500 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-emerald-400">
                <Tag size={11} className="stroke-[2.5]" /> SALE {percent}% OFF
              </span>
            )}
          </div>

          {hasDiscount && (
            <p className="mt-2 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <span>Special Offer:</span>
              <span>You save ₹{savings.toLocaleString('en-IN')} ({percent}% discount)</span>
            </p>
          )}

          <p className="mt-4 sm:mt-6 max-w-md text-xs sm:text-sm leading-relaxed text-[#4A433A] font-light">
            {product.description}
          </p>

          {/* Guarantee Badges */}
          <div className="my-5 sm:my-6 grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 border-y-2 border-[#C59B27]/30 py-3.5 sm:py-4 text-xs text-[#4A433A]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
              <span>100% Original Pure Concentrate</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#D4AF37] shrink-0" />
              <span>Complimentary Shipping ₹2,999+</span>
            </div>
          </div>

          {/* Luxury Variant Selector (20ml, 50ml, 100ml, etc.) */}
          {variants.length > 0 && (
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <p className="font-kufi text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#9E781E]">
                  SELECT BOTTLE SIZE / VARIANT
                </p>
                {selectedVariant && (
                  <span className="text-xs text-[#4A433A] font-medium">
                    Selected: <strong className="text-[#0D0C0A] font-bold">{selectedVariant.name}</strong>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {variants.map((v, idx) => {
                  const isSelected = idx === selectedVariantIndex;
                  const vPrice = Number(v.price) || 0;
                  const vMrp = Number(v.mrp) || 0;
                  const vHasDiscount = vMrp > vPrice && vPrice > 0;
                  const vPercent = vHasDiscount ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0;

                  return (
                    <button
                      key={v.id || v.name || idx}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`group relative flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#0D0C0A] text-[#FAF6ED] shadow-[0_4px_16px_rgba(212,175,55,0.25)] ring-2 ring-[#D4AF37]/50 scale-[1.02]'
                          : 'border-[#C59B27]/40 bg-[#FAF6ED] text-[#0D0C0A] hover:border-[#D4AF37] hover:bg-white'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span
                          className={`font-kufi text-xs sm:text-sm font-bold tracking-wider ${
                            isSelected ? 'text-[#D4AF37]' : 'text-[#0D0C0A]'
                          }`}
                        >
                          {v.name}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            isSelected ? 'text-zinc-300' : 'text-[#6B6256]'
                          }`}
                        >
                          ₹{vPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {vHasDiscount && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300'
                              : 'border-emerald-600/40 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {vPercent}% OFF
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div>
            <p className="font-kufi mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E781E]">
              SELECT QUANTITY
            </p>
            <div className="flex w-fit items-center border-2 border-[#C59B27]/40 bg-white rounded">
              <button
                className="px-4 py-2 text-[#4A433A] hover:text-[#0D0C0A]"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-bold text-[#0D0C0A]">
                {qty}
              </span>
              <button
                className="px-4 py-2 text-[#4A433A] hover:text-[#0D0C0A]"
                aria-label="Increase quantity"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action CTAs (Bold Black & Gold) */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-3.5 w-full">
            <button
              onClick={handleAddToCart}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 border-2 border-[#D4AF37] bg-[#0D0C0A] px-6 sm:px-8 py-3.5 text-xs font-bold font-kufi tracking-[0.16em] sm:tracking-[0.2em] text-[#D4AF37] shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all text-center"
            >
              <ShoppingBag size={15} />
              <span>ADD TO BAG — ₹{(currentSellingPrice * qty).toLocaleString('en-IN')}</span>
            </button>

            <button
              onClick={handleDirectWhatsAppOrder}
              className="flex w-full sm:w-auto items-center justify-center gap-2 border-2 border-[#25D366] bg-[#25D366]/10 px-6 py-3.5 text-xs font-bold font-kufi tracking-[0.14em] sm:tracking-[0.16em] text-emerald-800 hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer text-center"
            >
              <MessageCircle size={16} />
              <span>ORDER VIA WHATSAPP</span>
            </button>
          </div>

          <p className="mt-3 sm:mt-4 text-[11px] text-[#6B6256]">
            Direct WhatsApp ordering allows seamless consultation and instant shipment confirmation with our boutique.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 md:mt-28 border-t-2 border-[#C59B27]/30 pt-10 sm:pt-16">
          <div className="mb-6 sm:mb-10 text-center sm:text-left">
            <p className="font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#9E781E] uppercase">
              COMPLEMENTARY CREATIONS
            </p>
            <h2 className="mt-1 font-rakkas text-3xl sm:text-4xl md:text-5xl text-[#0D0C0A]">
              You May Also Appreciate
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-rakkas text-xl sm:text-2xl text-[#F4EBD9]">
                {product.name}
              </h3>
              <p className="font-kufi text-[11px] text-[#D4AF37] tracking-wider uppercase">
                {activeItem?.type === 'video'
                  ? 'Cinematic Video Showcase'
                  : `Photo ${activeMediaIndex + 1} of ${mediaItems.length}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex size-10 items-center justify-center rounded-full border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X size={20} />
            </button>
          </div>

          {/* Large Center Stage */}
          <div
            className="relative flex flex-1 items-center justify-center p-2 sm:p-6 overflow-hidden max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem?.type === 'video' ? (
              videoDetails?.type === 'youtube' ? (
                <iframe
                  src={videoDetails.embedUrl}
                  title={`${product.name} Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full max-w-4xl max-h-[70vh] border border-[#D4AF37]/30 rounded shadow-2xl"
                />
              ) : (
                <video
                  key={`lightbox-${activeItem.url}`}
                  src={activeItem.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70vh] max-w-full object-contain border border-[#D4AF37]/30 shadow-2xl"
                />
              )
            ) : (
              <img
                src={activeItem?.url || product.image}
                alt={activeItem?.title || product.name}
                className="max-h-[70vh] max-w-full object-contain border border-[#D4AF37]/30 shadow-2xl"
              />
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  aria-label="Previous"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/70 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer shadow-lg"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  aria-label="Next"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/70 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer shadow-lg"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {mediaItems.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaItems.map((item, idx) => (
                <button
                  key={`lb-thumb-${idx}`}
                  type="button"
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative size-12 sm:size-14 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                    idx === activeMediaIndex
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                      : 'border-[#D4AF37]/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.type === 'video' ? (item.poster || product.image) : item.url}
                    alt="Thumb"
                    className="h-full w-full object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Play size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Contact & Delivery Popup for WhatsApp Orders */}
      {itemToOrder && (
        <WhatsAppOrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          items={[itemToOrder]}
          subtotal={currentSellingPrice * qty}
        />
      )}
    </main>
  );
}
