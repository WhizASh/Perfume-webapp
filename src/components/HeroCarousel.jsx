import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCarousel } from '../context/CarouselContext';
import { initialSlides } from '../data/carousel';

export default function HeroCarousel() {
  const navigate = useNavigate();
  const { slides: contextSlides } = useCarousel();
  const slides = (contextSlides && contextSlides.length > 0) ? contextSlides : initialSlides;
  const activeSlides = slides.filter((s) => s.active !== false);
  const displaySlides = activeSlides.length > 0 ? activeSlides : slides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Auto-slide effect (5.5 seconds), paused on hover
  useEffect(() => {
    if (isHovered || displaySlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, displaySlides.length, currentIndex]);

  const goToNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const goToPrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      goToNext();
    } else if (distance < -45) {
      goToPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];
  const targetLink = currentSlide?.ctaLink || '/shop';
  const hasTextContent = Boolean(
    currentSlide?.title ||
    currentSlide?.subtitle ||
    currentSlide?.tag ||
    currentSlide?.description
  );

  // Handle banner-wide click redirect to product or offer
  const handleBannerClick = (e) => {
    // If the click originated from an explicit link or button, allow that specific action
    if (e.target.closest('button, a, input')) return;

    if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
      window.open(targetLink, '_blank', 'noopener,noreferrer');
    } else {
      navigate(targetLink);
    }
  };

  return (
    <section
      id="hero"
      aria-label="Hero Carousel"
      className="relative min-h-[480px] xs:min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] w-full overflow-hidden bg-[#F4EBD9]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          onClick={handleBannerClick}
          className={`absolute inset-0 select-none ${targetLink ? 'cursor-pointer' : ''}`}
          title={targetLink ? `Click banner to view: ${targetLink}` : undefined}
        >
          {/* Background / Hero Banner Image - 100% Fully Visible with No Dark Overlays / Opacity */}
          <img
            src={currentSlide.image}
            alt={currentSlide.title || 'Hero Banner'}
            className="h-full w-full object-cover object-center"
          />

          {/* Text Content Overlay - High-contrast text without dimming the carousel image */}
          {hasTextContent && (
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 py-12 xs:px-7 xs:py-16 sm:px-10 sm:py-20 md:px-16 lg:px-20 pointer-events-none">
              <div className="max-w-2xl pointer-events-auto">
                {/* Promotional Tag / Badge */}
                {currentSlide.tag && (
                  <div className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#D4AF37] bg-black/90 px-3 py-1 sm:px-4 sm:py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md">
                    <Sparkles size={12} className="text-[#D4AF37]" />
                    <span className="font-kufi text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#D4AF37]">
                      {currentSlide.tag}
                    </span>
                  </div>
                )}

                {/* Subtitle / Eyebrow */}
                {currentSlide.subtitle && (
                  <p className="font-kufi mb-1.5 sm:mb-2 text-[10.5px] sm:text-xs font-bold tracking-[0.24em] sm:tracking-[0.28em] text-[#D4AF37] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {currentSlide.subtitle}
                  </p>
                )}

                {/* Main Headline (Arabic Calligraphic Display) */}
                {currentSlide.title && (
                  <h1 className="font-rakkas text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] sm:leading-[0.98] font-normal tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {currentSlide.title}
                  </h1>
                )}

                {/* Description */}
                {currentSlide.description && (
                  <p className="mt-3 sm:mt-5 max-w-lg text-xs xs:text-sm sm:text-base leading-relaxed text-zinc-100 font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-3 xs:line-clamp-none">
                    {currentSlide.description}
                  </p>
                )}

                {/* CTA Action Buttons */}
                <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-4 w-full xs:w-auto">
                  <Link
                    to={targetLink}
                    onClick={(e) => e.stopPropagation()}
                    className="group relative inline-flex items-center justify-center overflow-hidden border-2 border-[#D4AF37] bg-[#D4AF37] px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold font-kufi tracking-[0.18em] sm:tracking-[0.2em] text-[#0D0C0A] shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all hover:bg-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37]"
                  >
                    <span>{currentSlide.ctaText || 'DISCOVER SCENTS'}</span>
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>

                  <Link
                    to="/shop"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center border-2 border-white/60 bg-black/85 px-5 sm:px-7 py-3 sm:py-3.5 text-xs font-semibold font-kufi tracking-[0.16em] sm:tracking-[0.18em] text-white shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    VIEW ALL CATALOG
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {displaySlides.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-2 xs:px-4 sm:px-8">
          <button
            onClick={goToPrev}
            aria-label="Previous slide"
            className="pointer-events-auto grid size-8.5 sm:size-11 place-items-center rounded-full border border-[#D4AF37]/50 bg-black/75 text-[#D4AF37] shadow-[0_2px_12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.6)]"
          >
            <ChevronLeft className="size-4.5 sm:size-5.5" />
          </button>

          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="pointer-events-auto grid size-8.5 sm:size-11 place-items-center rounded-full border border-[#D4AF37]/50 bg-black/75 text-[#D4AF37] shadow-[0_2px_12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.6)]"
          >
            <ChevronRight className="size-4.5 sm:size-5.5" />
          </button>
        </div>
      )}

      {/* Bottom Indicator Dots / Pills */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {displaySlides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'w-7 sm:w-10 bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.9)]'
                  : 'w-2 sm:w-2.5 bg-white/70 shadow-[0_1px_4px_rgba(0,0,0,0.8)] hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
