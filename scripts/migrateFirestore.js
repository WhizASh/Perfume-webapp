import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { products } from '../src/data/products.js';
import { initialCategories } from '../src/data/categories.js';
import { initialSlides } from '../src/data/carousel.js';

// Resolve and load .env file from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (typeof process.loadEnvFile === 'function' && fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    // fallback
  }
}

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration missing from .env');
  console.error('Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set in .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runMigration() {
  console.log('===========================================================');
  console.log('🚀 FIRESTORE DATABASE MIGRATION TO SCHEMA VERSION 2');
  console.log(`📁 Project Target: ${firebaseConfig.projectId}`);
  console.log('===========================================================\n');

  // 1. PRODUCTS COLLECTION MIGRATION
  console.log('📦 Step 1: Migrating Products Collection...');
  const productsSnap = await getDocs(collection(db, 'products'));
  const demoProductsMap = new Map(products.map((p) => [p.id, p]));

  let updatedCount = 0;
  let seededCount = 0;
  const purgedFieldsSummary = {
    sellingPrice: 0,
    badge: 0,
    media: 0,
  };

  if (productsSnap.empty) {
    console.log('   ℹ️  Firestore "products" collection is currently empty. Seeding all 12 demo products...');
    for (const prod of products) {
      const { id, ...data } = prod;
      await setDoc(
        doc(db, 'products', id),
        {
          id,
          ...data,
          schemaVersion: 2,
          updatedAt: serverTimestamp(),
        },
        { merge: false }
      );
      seededCount++;
      console.log(`   ✓ Seeded: ${prod.name} (${id}) [${prod.variants?.length || 0} variants]`);
    }
  } else {
    console.log(`   Found ${productsSnap.size} existing products in Firestore. Inspecting and migrating...`);

    for (const docSnap of productsSnap.docs) {
      const existing = docSnap.data();
      const docId = docSnap.id;
      const demoMatch = demoProductsMap.get(docId);

      // Track purged redundant fields
      if (existing.sellingPrice !== undefined) purgedFieldsSummary.sellingPrice++;
      if (existing.badge !== undefined) purgedFieldsSummary.badge++;
      if (existing.media !== undefined) purgedFieldsSummary.media++;

      // Variants normalization
      let variants = [];
      if (Array.isArray(existing.variants) && existing.variants.length > 0) {
        variants = existing.variants
          .map((v, i) => ({
            id: v.id || `v-${i + 1}`,
            name: String(v.name || '').trim(),
            price: Number(v.price) || 0,
            mrp:
              v.mrp !== undefined && v.mrp !== null && v.mrp !== ''
                ? Number(v.mrp)
                : Number(v.price) || 0,
          }))
          .filter((v) => v.name.length > 0);
      } else if (demoMatch && Array.isArray(demoMatch.variants) && demoMatch.variants.length > 0) {
        variants = demoMatch.variants;
      } else {
        const fallbackPrice = Number(existing.price ?? existing.sellingPrice) || 0;
        const fallbackMrp = Number(existing.mrp) || fallbackPrice;
        const fallbackSize = existing.size || '50 ml';
        variants = [{ id: 'v-1', name: fallbackSize, price: fallbackPrice, mrp: fallbackMrp }];
      }

      const primaryVariant = variants[0];
      const basePrice = primaryVariant ? primaryVariant.price : (Number(existing.price) || 0);
      const baseMrp = primaryVariant ? (primaryVariant.mrp || primaryVariant.price) : (Number(existing.mrp) || basePrice);
      const baseSize = existing.size || primaryVariant?.name || '50 ml';

      // Images & video normalization
      const images = Array.isArray(existing.images) && existing.images.length > 0
        ? existing.images
        : (demoMatch?.images || (existing.image ? [existing.image] : []));
      const video = existing.video || demoMatch?.video || '';
      const image = existing.image || images[0] || '';

      // Clean schema v2 object (NO sellingPrice, NO badge, NO media)
      const cleanDoc = {
        id: docId,
        name: existing.name || demoMatch?.name || 'Fragrance',
        concentration: existing.concentration || demoMatch?.concentration || 'Eau de Parfum',
        family: existing.family || demoMatch?.family || 'Perfume',
        price: basePrice,
        mrp: baseMrp,
        size: baseSize,
        description: existing.description || demoMatch?.description || '',
        notes: existing.notes || demoMatch?.notes || '',
        image,
        images,
        video,
        variants,
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      };

      // OVERWRITE with { merge: false } to purge all unwhitelisted fields
      await setDoc(doc(db, 'products', docId), cleanDoc, { merge: false });
      updatedCount++;
      console.log(`   ✓ Migrated [${docId}]: "${cleanDoc.name}" -> ${variants.length} variants | Base: ₹${cleanDoc.price} | MRP: ₹${cleanDoc.mrp}`);
    }

    // Check if any demo product was missing from Firestore
    for (const [demoId, demoProd] of demoProductsMap.entries()) {
      const exists = productsSnap.docs.some((d) => d.id === demoId);
      if (!exists) {
        const { id, ...data } = demoProd;
        await setDoc(
          doc(db, 'products', demoId),
          {
            id: demoId,
            ...data,
            schemaVersion: 2,
            updatedAt: serverTimestamp(),
          },
          { merge: false }
        );
        seededCount++;
        console.log(`   + Added missing demo product: ${demoProd.name} (${demoId})`);
      }
    }
  }

  // 2. CATEGORIES COLLECTION MIGRATION
  console.log('\n📁 Step 2: Verifying Categories Collection...');
  const catSnap = await getDocs(collection(db, 'categories'));
  if (catSnap.empty) {
    console.log(`   Categories collection empty. Seeding ${initialCategories.length} categories...`);
    for (const cat of initialCategories) {
      const { id, ...data } = cat;
      await setDoc(doc(db, 'categories', id), {
        id,
        ...data,
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      }, { merge: false });
    }
    console.log(`   ✓ Seeded ${initialCategories.length} categories.`);
  } else {
    console.log(`   Found ${catSnap.size} categories. Stamping schemaVersion: 2...`);
    for (const c of catSnap.docs) {
      await setDoc(doc(db, 'categories', c.id), {
        ...c.data(),
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  // 3. CAROUSEL COLLECTION MIGRATION
  console.log('\n🎠 Step 3: Verifying Carousel Slides Collection...');
  const slideSnap = await getDocs(collection(db, 'carousel'));
  if (slideSnap.empty) {
    console.log(`   Carousel collection empty. Seeding ${initialSlides.length} slides...`);
    for (const slide of initialSlides) {
      const { id, ...data } = slide;
      await setDoc(doc(db, 'carousel', id), {
        id,
        ...data,
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      }, { merge: false });
    }
    console.log(`   ✓ Seeded ${initialSlides.length} carousel slides.`);
  } else {
    console.log(`   Found ${slideSnap.size} carousel slides. Stamping schemaVersion: 2...`);
    for (const s of slideSnap.docs) {
      await setDoc(doc(db, 'carousel', s.id), {
        ...s.data(),
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  console.log('\n===========================================================');
  console.log('✅ FIRESTORE MIGRATION TO SCHEMA V2 COMPLETE!');
  console.log(`   - Existing products migrated: ${updatedCount}`);
  console.log(`   - New products seeded: ${seededCount}`);
  console.log(`   - Redundant fields purged across docs:`);
  console.log(`       * 'sellingPrice': ${purgedFieldsSummary.sellingPrice}`);
  console.log(`       * 'badge': ${purgedFieldsSummary.badge}`);
  console.log(`       * 'media': ${purgedFieldsSummary.media}`);
  console.log('   - All documents now active with schemaVersion: 2');
  console.log('===========================================================');

  process.exit(0);
}

runMigration().catch((err) => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
