-- 自定义模板表：保存编辑区内容及其内联排版标签（字体/字号/颜色/对齐/加粗/斜体等）
create table public.custom_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 50),
  content text not null check (char_length(content) between 1 and 50000),
  created_at timestamptz not null default now()
);

alter table public.custom_templates enable row level security;

-- 匿名工具应用（无登录体系）：模板库公开读取与保存；不支持更新，仅允许删除
create policy "custom_templates_anon_select" on public.custom_templates
  for select to anon using (true);
create policy "custom_templates_anon_insert" on public.custom_templates
  for insert to anon with check (true);
create policy "custom_templates_anon_delete" on public.custom_templates
  for delete to anon using (true);
create policy "custom_templates_auth_select" on public.custom_templates
  for select to authenticated using (true);
create policy "custom_templates_auth_insert" on public.custom_templates
  for insert to authenticated with check (true);
create policy "custom_templates_auth_delete" on public.custom_templates
  for delete to authenticated using (true);