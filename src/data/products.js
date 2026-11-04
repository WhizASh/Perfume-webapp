// Demo catalog categorized strictly under: Perfume, Attar, Bakhoor, Topi, Books
// Enhanced with multiple high-resolution photos, video showcases, and multiple variants (e.g. 20ml, 50ml, 100ml)

export const products = [
  // 1. PERFUME
  {
    id: 'oud-royale',
    name: 'Oud Royale',
    mrp: 4999,
    price: 3499,
    concentration: 'Eau de Parfum',
    notes: 'Woody · Amber · Royal Saffron',
    family: 'Perfume',
    size: '50 ml',
    variants: [
      { id: 'oud-royale-20ml', name: '20 ml', price: 1799, mrp: 2499 },
      { id: 'oud-royale-50ml', name: '50 ml', price: 3499, mrp: 4999 },
      { id: 'oud-royale-100ml', name: '100 ml', price: 5999, mrp: 7999 },
    ],
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'A rich, majestic Eau de Parfum with warm golden amber and smoky Cambodian oud.',
  },
  {
    id: 'rose-eternelle',
    name: 'Rose Éternelle',
    mrp: 3999,
    price: 2899,
    concentration: 'Eau de Parfum',
    notes: 'Taif Rose · Velvet Musk · Vanilla',
    family: 'Perfume',
    size: '50 ml',
    variants: [
      { id: 'rose-eternelle-20ml', name: '20 ml', price: 1499, mrp: 1999 },
      { id: 'rose-eternelle-50ml', name: '50 ml', price: 2899, mrp: 3999 },
      { id: 'rose-eternelle-100ml', name: '100 ml', price: 4899, mrp: 6499 },
    ],
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'A graceful French-oriental floral composition with a lingering, velvety finish.',
  },
  {
    id: 'noir-intense',
    name: 'Noir Intense',
    mrp: 4499,
    price: 3299,
    concentration: 'Eau de Parfum',
    notes: 'Italian Bergamot · Leather · Dark Woods',
    family: 'Perfume',
    size: '50 ml',
    variants: [
      { id: 'noir-intense-20ml', name: '20 ml', price: 1699, mrp: 2299 },
      { id: 'noir-intense-50ml', name: '50 ml', price: 3299, mrp: 4499 },
      { id: 'noir-intense-100ml', name: '100 ml', price: 5499, mrp: 7299 },
    ],
    image:
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    description: 'A captivating, confident evening perfume crafted for commanding presence.',
  },

  // 2. ATTAR
  {
    id: 'dehn-al-oud-sultani',
    name: 'Dehn Al Oud Sultani',
    mrp: 6999,
    price: 4999,
    concentration: 'Pure Concentrated Attar',
    notes: 'Aged Assam Agarwood · Smoky Woods · Sweet Resins',
    family: 'Attar',
    size: '12 ml (1 Tola)',
    variants: [
      { id: 'dehn-oud-3ml', name: '3 ml (1/4 Tola)', price: 1499, mrp: 1999 },
      { id: 'dehn-oud-6ml', name: '6 ml (1/2 Tola)', price: 2699, mrp: 3699 },
      { id: 'dehn-oud-12ml', name: '12 ml (1 Tola)', price: 4999, mrp: 6999 },
    ],
    image:
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Rare aged Indian agarwood oil extracted through traditional copper alembic hydro-distillation. Zero alcohol.',
  },
  {
    id: 'amber-musk-attar',
    name: 'Royal Amber & White Musk',
    mrp: 2999,
    price: 1999,
    concentration: 'Pure Attar Oil',
    notes: 'Silky White Musk · Golden Amber · Taif Rose',
    family: 'Attar',
    size: '12 ml (1 Tola)',
    variants: [
      { id: 'amber-musk-3ml', name: '3 ml', price: 699, mrp: 999 },
      { id: 'amber-musk-6ml', name: '6 ml', price: 1199, mrp: 1699 },
      { id: 'amber-musk-12ml', name: '12 ml (1 Tola)', price: 1999, mrp: 2999 },
    ],
    image:
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'A soothing, celestial attar oil blended with pure botanical and resinous extracts.',
  },
  {
    id: 'ruh-khus-imperial',
    name: 'Ruh Khus Imperial',
    mrp: 3499,
    price: 2499,
    concentration: 'Pure Wild Vetiver Attar',
    notes: 'Wild Green Vetiver · Earthy Rain · Cool Woods',
    family: 'Attar',
    size: '12 ml (1 Tola)',
    variants: [
      { id: 'ruh-khus-3ml', name: '3 ml', price: 799, mrp: 1099 },
      { id: 'ruh-khus-6ml', name: '6 ml', price: 1399, mrp: 1899 },
      { id: 'ruh-khus-12ml', name: '12 ml (1 Tola)', price: 2499, mrp: 3499 },
    ],
    image:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'Traditional copper-deg distilled wild green vetiver from North India with cooling earthy serenity.',
  },

  // 3. BAKHOOR
  {
    id: 'adeni-royal-bakhoor',
    name: 'Adeni Royal Bakhoor',
    mrp: 1999,
    price: 1499,
    concentration: 'Artisanal Incense',
    notes: 'Agarwood Chips · Frankincense · Amber Resin',
    family: 'Bakhoor',
    size: '70g Jar',
    variants: [
      { id: 'adeni-40g', name: '40g Box', price: 999, mrp: 1299 },
      { id: 'adeni-70g', name: '70g Jar', price: 1499, mrp: 1999 },
      { id: 'adeni-150g', name: '150g Tin', price: 2899, mrp: 3699 },
    ],
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    description: 'Slow-burning natural wood chips soaked in pure fragrant oils to scent spaces and garments.',
  },
  {
    id: 'muattar-oud-al-malaki',
    name: 'Muattar Oud Al-Malaki',
    mrp: 2999,
    price: 2199,
    concentration: 'Royal Oudh Incense',
    notes: 'Cambodi Wood Chips · Rose Essential Oil · Musk',
    family: 'Bakhoor',
    size: '100g Tin',
    variants: [
      { id: 'muattar-50g', name: '50g Jar', price: 1299, mrp: 1799 },
      { id: 'muattar-100g', name: '100g Tin', price: 2199, mrp: 2999 },
      { id: 'muattar-250g', name: '250g Pack', price: 4499, mrp: 5999 },
    ],
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'Hand-selected Cambodi wood chips drenched in fragrant oil blends for ceremonial and home gatherings.',
  },

  // 4. TOPI
  {
    id: 'omani-embroidered-topi',
    name: 'Omani Embroidered Topi',
    mrp: 1299,
    price: 899,
    concentration: 'Traditional Handcraft',
    notes: 'Fine Cotton · Gold Thread Needlework',
    family: 'Topi',
    size: 'Standard 22"',
    variants: [
      { id: 'omani-topi-21', name: 'Size 21.5"', price: 899, mrp: 1299 },
      { id: 'omani-topi-22', name: 'Size 22"', price: 899, mrp: 1299 },
      { id: 'omani-topi-225', name: 'Size 22.5"', price: 899, mrp: 1299 },
    ],
    image:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'A breathable, delicately hand-embroidered traditional prayer cap with regal metallic motif detailing.',
  },
  {
    id: 'turkish-velvet-topi',
    name: 'Turkish Ottoman Velvet Topi',
    mrp: 1699,
    price: 1199,
    concentration: 'Handmade Velvet',
    notes: 'Plush Velvet · Floral Silk Stitching · Satin Lining',
    family: 'Topi',
    size: 'Standard 22.5"',
    variants: [
      { id: 'turkish-topi-22', name: 'Size 22"', price: 1199, mrp: 1699 },
      { id: 'turkish-topi-225', name: 'Size 22.5"', price: 1199, mrp: 1699 },
      { id: 'turkish-topi-23', name: 'Size 23"', price: 1199, mrp: 1699 },
    ],
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'Exquisite Ottoman-inspired prayer topi fashioned from rich velvet with handcrafted silk embroidery.',
  },

  // 5. BOOKS
  {
    id: 'fragrance-of-faith-book',
    name: 'The Fragrance of Faith',
    mrp: 1199,
    price: 799,
    concentration: 'Hardcover Collector Edition',
    notes: 'Spiritual Reflections · History of Attar Tradition',
    family: 'Books',
    size: '320 Pages',
    variants: [
      { id: 'faith-hardcover', name: 'Standard Hardcover', price: 799, mrp: 1199 },
      { id: 'faith-deluxe', name: 'Deluxe Velvet Slipcase', price: 1399, mrp: 1899 },
    ],
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'An illuminating volume celebrating the sacred tradition, botanical history, and art of fine perfumery in Islamic culture.',
  },
  {
    id: 'art-of-arabian-incense-book',
    name: 'The Book of Arabian Aromatics',
    mrp: 1499,
    price: 999,
    concentration: 'Illustrated Hardcover',
    notes: 'Oudh, Frankincense & Natural Botanicals',
    family: 'Books',
    size: '280 Pages',
    variants: [
      { id: 'aromatics-hardcover', name: 'Illustrated Hardcover', price: 999, mrp: 1499 },
      { id: 'aromatics-gilt', name: 'Gilt-Edged Edition', price: 1699, mrp: 2299 },
    ],
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    ],
    video: '',
    description: 'A beautifully illustrated reference on the origins, grading, and traditions of Oud, Bakhoor, and botanical oils.',
  },
];

export const families = ['All', 'Perfume', 'Attar', 'Bakhoor', 'Topi', 'Books'];
