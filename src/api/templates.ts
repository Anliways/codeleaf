import { supabase } from '@/db/supabase';
import type { CustomTemplate } from '@/types';

// 拉取自定义模板列表（创建时间倒序，限制条数防止全量拉取）
export const listCustomTemplates = async (): Promise<CustomTemplate[]> => {
  const { data, error } = await supabase
    .from('custom_templates')
    .select('id,name,content,created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

// 保存自定义模板（名称与内容校验在前置业务层完成）
export const createCustomTemplate = async (name: string, content: string): Promise<void> => {
  const { error } = await supabase.from('custom_templates').insert({ name, content });
  if (error) throw error;
};

// 删除自定义模板
export const deleteCustomTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase.from('custom_templates').delete().eq('id', id);
  if (error) throw error;
};
