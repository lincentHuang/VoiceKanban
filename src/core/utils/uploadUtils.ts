import { compressImage } from "./imageUtils";

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  storage: "r2" | "base64";
}

/**
 * Universal file upload utility with dual-engine fallback:
 * 1. Primary: High-speed Cloudflare R2 object storage via S3 protocol (/api/upload)
 * 2. Secondary / Offline Fallback: Local client-side compressed base64
 */
export async function uploadFile(
  fileOrBlob: File | Blob,
  fileName?: string,
  folder: string = "uploads"
): Promise<UploadResult> {
  const name = fileName || (fileOrBlob instanceof File ? fileOrBlob.name : `file-${Date.now()}`);
  const type = fileOrBlob.type || "application/octet-stream";
  const size = fileOrBlob.size;

  // 1. Try uploading to Cloudflare R2 API
  try {
    const formData = new FormData();
    // If it's a raw Blob without name, wrap as a File with name
    const uploadPayload = fileOrBlob instanceof File ? fileOrBlob : new File([fileOrBlob], name, { type });
    formData.append("file", uploadPayload);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data?.url) {
        return {
          url: json.data.url,
          name: json.data.name || name,
          size: json.data.size || size,
          type: json.data.type || type,
          storage: "r2",
        };
      }
    }
  } catch (error) {
    console.warn("R2 Cloudflare upload failed, falling back to local base64:", error);
  }

  // 2. Fallback: Base64 with compression for images
  if (type.startsWith("image/")) {
    try {
      const compressedUrl = await compressImage(fileOrBlob, 1600, 1600, 0.85);
      return {
        url: compressedUrl,
        name,
        size,
        type,
        storage: "base64",
      };
    } catch (e) {
      console.warn("Image compression failed, using direct data URL:", e);
    }
  }

  // Direct FileReader fallback for non-images or compression failure
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        url: e.target?.result as string,
        name,
        size,
        type,
        storage: "base64",
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrBlob);
  });
}
