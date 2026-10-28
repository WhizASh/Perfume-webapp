import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../firebase/config.js';

/**
 * Uploads a product image file to Firebase Storage.
 * @param {File|Blob} file - Image file to upload
 * @param {string} [customFileName] - Optional custom filename or identifier
 * @returns {Promise<string>} Public download URL of the uploaded image
 */
export async function uploadProductImage(file, customFileName) {
  if (!isFirebaseConfigured || !storage) {
    throw new Error(
      'Firebase Storage is not configured. Please supply Firebase credentials in .env.'
    );
  }

  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Create clean, unique file name
  const timestamp = Date.now();
  const sanitizedName = file.name
    ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    : 'image.jpg';
  const fileName = customFileName
    ? `${customFileName}_${timestamp}_${sanitizedName}`
    : `${timestamp}_${sanitizedName}`;

  const storageRef = ref(storage, `products/${fileName}`);

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  // Get and return the downloadable public URL
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
