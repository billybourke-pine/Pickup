// Client-side image compressor + Firebase Storage uploader.
// Resizes to max 1200px on the long edge, re-encodes as JPEG quality 0.78.
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const MAX_EDGE = 1200;
const QUALITY  = 0.78;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function compress(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth  * scale);
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
      'image/jpeg',
      QUALITY
    );
  });
}

/**
 * Compresses an image and uploads it to Firebase Storage at
 *   games/{uid}/{timestamp}-{random}.jpg
 * @param {File} file      Source image file from <input type="file">
 * @param {string} uid     Current user's uid (required for Storage rules)
 * @param {(pct:number)=>void} [onProgress] 0-1 progress callback
 * @returns {Promise<{url:string, path:string, size:number}>}
 */
export async function uploadGameImage(file, uid, onProgress) {
  if (!uid) throw new Error('You must be signed in to upload an image.');
  onProgress && onProgress(0.05);
  const blob = await compress(file);
  onProgress && onProgress(0.45);

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const path = `games/${uid}/${name}`;
  const r = ref(storage, path);

  await uploadBytes(r, blob, { contentType: 'image/jpeg' });
  onProgress && onProgress(0.9);
  const url = await getDownloadURL(r);
  onProgress && onProgress(1);
  return { url, path, size: blob.size };
}
