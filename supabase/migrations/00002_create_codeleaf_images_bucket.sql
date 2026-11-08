-- 创建 Codeleaf 图片上传公共 bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'codeleaf-images',
  'codeleaf-images',
  true,
  1048576,
  array['image/jpeg','image/png','image/gif','image/webp','image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 匿名用户可上传自己的图片（RLS 配合前端的 anon key）
create policy "Allow anonymous uploads to codeleaf-images"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'codeleaf-images');

-- 公共读取
 create policy "Allow public reads from codeleaf-images"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'codeleaf-images');
