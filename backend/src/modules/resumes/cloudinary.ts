import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true
  });
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
}

export async function uploadResume(
  buffer: Buffer,
  filename: string
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured) {
    const publicId = `local-${Date.now()}-${filename}`;
    return {
      publicId,
      url: `https://placehold.co/600x800?text=${encodeURIComponent(publicId)}`
    };
  }

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'codetrack/resumes',
        resource_type: 'auto',
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ publicId: result.public_id, url: result.secure_url });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteResume(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured) {
    return;
  }
  if (publicId.startsWith('local-')) {
    return;
  }
  await cloudinary.uploader.destroy(publicId);
}
