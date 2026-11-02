import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCarousel } from '../context/CarouselContext';
import { initialSlides } from '../data/carousel';

export default function HeroCarousel() {
  const { slides: contextSlides } = useCarousel();
  const slides = (contextSlides && contextSlides.length > 0) ? contextSlides : initialSlides;
  const activeSlides = slides.filter((s) => s.active !== false);
  const displaySlides = activeSlides.length > 0 ? activeSlides : slides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

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

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];
  const hasTextContent = Boolean(
    currentSlide?.title ||
    currentSlide?.subtitle ||
    currentSlide?.tag ||
    currentSlide?.description
  );

  return (
    <section
      aria-label="Hero Carousel"
      className="relative min-h-[460px] sm:min-h-[540px] md:min-h-[620px] lg:min-h-[680px] w-full overflow-hidden bg-[#0A0A0A]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background / Hero Banner Image - 100% Fully Visible with No Dark Overlays / Opacity */}
          <img
            src={currentSlide.image}
            alt={currentSlide.title || 'Hero Banner'}
            className="h-full w-full object-cover object-center"
          />

          {/* Direct Banner Link for pure graphical banners */}
          {!hasTextContent && currentSlide.ctaLink && (
            <Link
              to={currentSlide.ctaLink}
              className="absolute inset-0 z-10 block"
              aria-label={currentSlide.title || 'Promotional Banner'}
            />
          )}

          {/* Text Content Overlay - High-contrast text without dimming the carousel image */}
          {hasTextContent && (
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 py-20 sm:px-10 md:px-16 lg:px-20 pointer-events-none">
              <div className="max-w-2xl pointer-events-auto">
                {/* Promotional Tag / Badge */}
                {currentSlide.tag && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/70 bg-black/85 px-4 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md">
                    <Sparkles size={13} className="text-[#D4AF37]" />
                    <span className="text-[10px] font-semibold tracking-[0.25em] text-[#E5C378]">
                      {currentSlide.tag}
                    </span>
                  </div>
                )}

                {/* Subtitle / Eyebrow */}
                {currentSlide.subtitle && (
                  <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-[#D4AF37] uppercase sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {currentSlide.subtitle}
                  </p>
                )}

                {/* Main Headline */}
                {currentSlide.title && (
                  <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.98] font-normal tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {currentSlide.title}
                  </h1>
                )}

                {/* Description */}
                {currentSlide.description && (
                  <p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-100 font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                    {currentSlide.description}
                  </p>
                )}

                {/* CTA Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to={currentSlide.ctaLink || '/shop'}
                    className="group relative inline-flex items-center justify-center overflow-hidden border border-[#D4AF37] bg-[#D4AF37] px-8 py-3.5 text-xs font-bold tracking-[0.2em] text-[#0A0A0A] shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all hover:bg-[#E5C378] hover:border-[#E5C378]"
                  >
                    <span>{currentSlide.ctaText || 'DISCOVER SCENTS'}</span>
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>

                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center border border-white/40 bg-black/85 px-7 py-3.5 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
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
        <div className="absolute inset-y-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-4 sm:px-8">
          <button
            onClick={goToPrev}
            aria-label="Previous slide"
            className="pointer-events-auto grid size-11 place-items-center rounded-full border border-[#D4AF37]/50 bg-black/75 text-[#D4AF37] shadow-[0_2px_12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.6)]"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="pointer-events-auto grid size-11 place-items-center rounded-full border border-[#D4AF37]/50 bg-black/75 text-[#D4AF37] shadow-[0_2px_12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.6)]"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {/* Bottom Indicator Dots / Pills */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2.5">
          {displaySlides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'w-10 bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.9)]'
                  : 'w-2.5 bg-white/70 shadow-[0_1px_4px_rgba(0,0,0,0.8)] hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
