import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../firebase/config.js';

/**
 * Converts a File or Blob into a Base64 data URL.
 * Used as a dependable fallback if Firebase Storage is unreachable or lacks write permissions.
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a product image file to Firebase Storage with automatic data-URL fallback.
 * @param {File|Blob} file - Image file to upload
 * @param {string} [customFileName] - Optional custom filename or identifier
 * @returns {Promise<string>} Public download URL or Base64 data URL
 */
export async function uploadProductImage(file, customFileName) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // If Firebase Storage is configured, attempt remote upload
  if (isFirebaseConfigured && storage) {
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name
        ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        : 'image.jpg';
      const fileName = customFileName
        ? `${customFileName}_${timestamp}_${sanitizedName}`
        : `${timestamp}_${sanitizedName}`;

      const storageRef = ref(storage, `products/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });

      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn(
        'Firebase Storage product upload failed (permissions or network). Falling back to local image data:',
        err.message
      );
    }
  }

  // Resilient fallback
  return await fileToDataUrl(file);
}

/**
 * Uploads a carousel slide image file to Firebase Storage with automatic data-URL fallback.
 * @param {File|Blob} file - Image file to upload
 * @param {string} [customFileName] - Optional custom filename or identifier
 * @returns {Promise<string>} Public download URL or Base64 data URL
 */
export async function uploadCarouselImage(file, customFileName) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  if (isFirebaseConfigured && storage) {
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name
        ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        : 'slide.jpg';
      const fileName = customFileName
        ? `${customFileName}_${timestamp}_${sanitizedName}`
        : `slide_${timestamp}_${sanitizedName}`;

      const storageRef = ref(storage, `carousel/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });

      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn(
        'Firebase Storage carousel upload failed (permissions or network). Falling back to local image data:',
        err.message
      );
    }
  }

  // Resilient fallback
  return await fileToDataUrl(file);
}
