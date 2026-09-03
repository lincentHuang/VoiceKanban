import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Server-side Cloudflare R2 Client & Helper Utilities
 */

const getR2Config = () => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  let publicUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").trim();

  // Strip trailing slash
  if (publicUrl.endsWith("/")) {
    publicUrl = publicUrl.slice(0, -1);
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
};

export const isR2Configured = (): boolean => {
  const config = getR2Config();
  return Boolean(
    config.accountId &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
};

export const getR2Client = (): S3Client | null => {
  const config = getR2Config();
  if (!isR2Configured()) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
  });
};

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  name: string;
  type: string;
}

/**
 * Upload a file buffer directly to Cloudflare R2
 */
export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<UploadResult> {
  const config = getR2Config();
  const client = getR2Client();

  if (!client || !config.bucketName) {
    throw new Error("Cloudflare R2 is not configured on the server");
  }

  // Generate safe unique key
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${timestamp}-${randomSuffix}-${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType || "application/octet-stream",
  });

  await client.send(command);

  // Construct public CDN URL
  const publicUrl = config.publicUrl || `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com`;
  const fileUrl = `${publicUrl}/${key}`;

  return {
    url: fileUrl,
    key,
    size: fileBuffer.length,
    name: fileName,
    type: contentType,
  };
}
