import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import {
  compressImageToFit,
  isAllowedImageType,
  sanitizeFileName,
} from '@/lib/editor/image';

interface UseImageUploadOptions {
  onInsert: (markdown: string, cursor: number) => void;
}

/**
 * 图片上传 Hook
 * 压缩后上传 Supabase Storage，成功后在光标处插入 Markdown 图片语法
 */
export function useImageUpload({ onInsert }: UseImageUploadOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!isAllowedImageType(file.type)) {
        toast.error('仅支持 JPEG、PNG、GIF、WEBP、AVIF 格式图片');
        return;
      }

      setUploading(true);
      try {
        const compressed = await compressImageToFit(file);
        const path = `uploads/${Date.now()}_${sanitizeFileName(compressed.name)}`;
        const { error } = await supabase.storage
          .from('codeleaf-images')
          .upload(path, compressed, { cacheControl: '3600', upsert: false });
        if (error) throw error;

        const { data } = supabase.storage.from('codeleaf-images').getPublicUrl(path);
        const imageUrl = data.publicUrl;
        const insertion = `![图片](${imageUrl})\n`;
        onInsert(insertion, insertion.length);
        toast.success(
          compressed.size === file.size
            ? '图片上传成功并已插入'
            : `图片已压缩至 ${(compressed.size / 1024).toFixed(1)} KB 并上传成功`,
        );
      } catch (err) {
        console.error(err);
        toast.error('图片上传失败，请重试');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onInsert],
  );

  return { inputRef, uploading, handleChange };
}
