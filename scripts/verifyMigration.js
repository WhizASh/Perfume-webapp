import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

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

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const snap = await getDocs(collection(db, 'products'));
console.log(`Auditing ${snap.size} Firestore products...`);

let issues = 0;
snap.forEach(docSnap => {
  const d = docSnap.data();
  if (d.sellingPrice !== undefined) {
    console.error(`❌ [${docSnap.id}] Still contains redundant 'sellingPrice'`);
    issues++;
  }
  if (d.badge !== undefined) {
    console.error(`❌ [${docSnap.id}] Still contains redundant 'badge'`);
    issues++;
  }
  if (d.media !== undefined) {
    console.error(`❌ [${docSnap.id}] Still contains redundant 'media'`);
    issues++;
  }
  if (d.schemaVersion !== 2) {
    console.error(`❌ [${docSnap.id}] schemaVersion is not 2 (got ${d.schemaVersion})`);
    issues++;
  }
  if (!Array.isArray(d.variants) || d.variants.length === 0) {
    console.error(`❌ [${docSnap.id}] Missing variants!`);
    issues++;
  }
});

if (issues === 0) {
  console.log(`\n🎉 VERIFICATION PASSED: All ${snap.size} Firestore products are 100% clean schema v2!`);
} else {
  console.error(`\n❌ VERIFICATION FAILED: Found ${issues} issues.`);
  process.exit(1);
}
process.exit(0);
