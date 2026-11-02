import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { products } from '../src/data/products.js';
import { initialCategories } from '../src/data/categories.js';
import { initialSlides } from '../src/data/carousel.js';

const firebaseConfig = {
  apiKey: "AIzaSyDQDeNn-o24PLtMg9Elw45r9Bd833rEEgs",
  authDomain: "perfume-e13e1.firebaseapp.com",
  projectId: "perfume-e13e1",
  storageBucket: "perfume-e13e1.firebasestorage.app",
  messagingSenderId: "229998802420",
  appId: "1:229998802420:web:0e7917fa5e5d1068f035a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ALLOWED_CATEGORY_IDS = new Set(initialCategories.map((c) => c.id));

async function seed() {
  console.log('--- Cleaning Up & Seeding Strictly 5 Categories & Demo Products ---');

  // 1. Clean up ANY category not in the 5 approved
  const categoriesSnap = await getDocs(collection(db, 'categories'));
  for (const docSnap of categoriesSnap.docs) {
    if (!ALLOWED_CATEGORY_IDS.has(docSnap.id)) {
      console.log(`  🗑 Removing previous category: ${docSnap.id}`);
      await deleteDoc(doc(db, 'categories', docSnap.id));
    }
  }

  // 2. Write the 5 approved categories
  console.log(`\nSeeding ${initialCategories.length} categories:`);
  for (const cat of initialCategories) {
    const { id, ...data } = cat;
    await setDoc(doc(db, 'categories', id), {
      id,
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`  ✓ Category: ${cat.name} (${id})`);
  }

  // 3. Clean up products collection and re-seed clean set
  const existingProductsSnap = await getDocs(collection(db, 'products'));
  const currentProductIds = new Set(products.map((p) => p.id));
  for (const docSnap of existingProductsSnap.docs) {
    if (!currentProductIds.has(docSnap.id)) {
      console.log(`  🗑 Removing obsolete product: ${docSnap.id}`);
      await deleteDoc(doc(db, 'products', docSnap.id));
    }
  }

  // 4. Seed all demo products under the 5 categories
  console.log(`\nSeeding ${products.length} products under the 5 categories:`);
  for (const prod of products) {
    const { id, ...data } = prod;
    await setDoc(doc(db, 'products', id), {
      id,
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`  ✓ [${prod.family.toUpperCase()}] ${prod.name} (${id}) — MRP: ₹${prod.mrp} | Selling: ₹${prod.price}`);
  }

  // 5. Verify final collections
  const finalCats = await getDocs(collection(db, 'categories'));
  console.log(`\nVerification: Firestore now has ${finalCats.size} categories:`);
  finalCats.forEach((d) => console.log(`   - ${d.id}: ${d.data().name}`));

  const finalProds = await getDocs(collection(db, 'products'));
  console.log(`Verification: Firestore now has ${finalProds.size} products.`);

  console.log('\n--- Complete! Only the 5 requested categories exist in Firestore. ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
