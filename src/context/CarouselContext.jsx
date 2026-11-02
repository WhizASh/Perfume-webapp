import { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchCarouselSlides,
  getLocalSlides,
  saveLocalSlides,
  createCarouselSlide,
  deleteCarouselSlide,
} from '../services/carouselService';

const CarouselContext = createContext(null);

export function CarouselProvider({ children }) {
  // Initialize immediately with cached or local slides (0ms latency, Stale-While-Revalidate)
  const [slides, setSlides] = useState(() => getLocalSlides());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSlides = async () => {
    try {
      setError(null);
      const data = await fetchCarouselSlides();
      setSlides(data);
    } catch (err) {
      console.error('Failed to load carousel slides:', err);
      setError(err.message || 'Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const addSlide = async (slideData, imageFile) => {
    const saved = await createCarouselSlide(slideData, imageFile);
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = saved;
      } else {
        next = [...prev, saved];
      }
      saveLocalSlides(next);
      return next;
    });
    return saved;
  };

  const removeSlide = async (id) => {
    await deleteCarouselSlide(id);
    setSlides((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveLocalSlides(next);
      return next;
    });
  };

  return (
    <CarouselContext.Provider
      value={{
        slides,
        loading,
        error,
        refreshSlides: loadSlides,
        addSlide,
        removeSlide,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
}

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
}
