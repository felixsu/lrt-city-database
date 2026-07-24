import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

const MAX_BYTES = 100 * 1024;
const MAX_DIMENSION = 2000;
// Progressively lower quality until the asset fits under MAX_BYTES.
const QUALITY_STEPS = [80, 70, 60, 50, 40, 30, 20, 10];

/** Fallback per-file upload cap, matching UploadSettings' default — see src/lib/upload-settings.ts. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Returns an error message if any file exceeds maxBytes, else null. */
export function findOversizedFile(files: File[], maxBytes: number): string | null {
  const tooBig = files.find((file) => file.size > maxBytes);
  const maxMb = Math.round(maxBytes / (1024 * 1024));
  return tooBig ? `"${tooBig.name}" is larger than ${maxMb}MB. Please choose a smaller file.` : null;
}

/**
 * Uploads an image, constraining it to MAX_DIMENSION px and iterating
 * quality downward until the stored asset is under MAX_BYTES. Re-uploads
 * to the same public_id on each retry so failed attempts don't pile up
 * as orphaned Cloudinary assets.
 */
export async function uploadCompressedImage(
  dataUri: string,
  folder: string
): Promise<UploadApiResponse> {
  let lastResult: UploadApiResponse | null = null;

  for (const quality of QUALITY_STEPS) {
    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      // Only set `folder` on the first attempt. On retries, `public_id` is
      // already fully-qualified from the previous response — in Dynamic
      // Folder Mode, re-passing `folder` alongside it prepends the folder
      // again on top of itself each time, eventually exceeding Cloudinary's
      // public_id length limit.
      ...(lastResult ? { public_id: lastResult.public_id } : { folder }),
      overwrite: true,
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      crop: "limit",
      quality,
      fetch_format: "auto",
    });
    lastResult = result;
    if (result.bytes <= MAX_BYTES) {
      return result;
    }
  }

  // Best effort: return the smallest attempt even if still above target.
  return lastResult as UploadApiResponse;
}

/**
 * Uploads a video as-is (no forced re-encode loop — the 10MB input cap is
 * the practical size ceiling), letting Cloudinary apply its own
 * quality/format optimization at upload time.
 */
export async function uploadVideo(dataUri: string, folder: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(dataUri, {
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    resource_type: "video",
    folder,
    overwrite: true,
    quality: "auto",
    fetch_format: "auto",
  });
}

export async function deleteImage(publicId: string, resourceType: "image" | "video" = "image") {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
