/**
 * 图片压缩与上传工具
 * 按 1MB 上限迭代压缩为 WEBP，并提供 Supabase 上传辅助
 */

const MAX_SIZE = 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

export const isAllowedImageType = (type: string): boolean => ALLOWED_TYPES.includes(type);

export const compressImageToFit = async (file: File): Promise<File> => {
  if (file.size <= MAX_SIZE && file.type === 'image/webp') return file;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  const ratio = Math.min(1, 1080 / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const toBlob = (q: number): Promise<Blob | null> =>
    new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', q));

  let quality = 0.8;
  let blob: Blob | null = await toBlob(quality);
  while (blob && blob.size > MAX_SIZE && quality > 0.2) {
    quality -= 0.05;
    blob = await toBlob(quality);
  }
  URL.revokeObjectURL(img.src);
  if (!blob) return file;
  return new File([blob], `image_${Date.now()}.webp`, { type: 'image/webp' });
};

export const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9.]/g, '_');
