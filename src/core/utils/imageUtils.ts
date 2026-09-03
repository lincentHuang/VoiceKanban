/**
 * Utility functions for image processing and compression
 */

/**
 * Compresses an image File or Blob to a compact Data URL (WebP or JPEG)
 * to prevent localStorage QuotaExceededError and keep document sizes lightweight.
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  maxWidth: number = 1280,
  maxHeight: number = 1280,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, read directly as data URL
    if (fileOrBlob.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBlob);
      return;
    }

    const objectUrl = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(fileOrBlob);
        return;
      }

      // Calculate scaled dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(fileOrBlob);
        return;
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format
      const hasAlpha = fileOrBlob.type === "image/png" || fileOrBlob.type === "image/webp";
      let outputType = "image/webp";

      try {
        const testData = canvas.toDataURL("image/webp", quality);
        if (testData.startsWith("data:image/webp")) {
          outputType = "image/webp";
        } else {
          outputType = hasAlpha ? "image/png" : "image/jpeg";
        }
      } catch {
        outputType = hasAlpha ? "image/png" : "image/jpeg";
      }

      const dataUrl = canvas.toDataURL(outputType, quality);
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(err);
      reader.readAsDataURL(fileOrBlob);
    };

    img.src = objectUrl;
  });
}
