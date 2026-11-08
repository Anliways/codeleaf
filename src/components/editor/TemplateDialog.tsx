import React, { useCallback, useEffect, useState } from 'react';
import { LayoutTemplate, Loader2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TEXT_TEMPLATES, type TextTemplate } from '@/lib/templates';
import {
  createCustomTemplate,
  deleteCustomTemplate,
  listCustomTemplates,
} from '@/api/templates';
import type { CustomTemplate } from '@/types';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (template: TextTemplate) => void;
  /** 当前编辑区内容（含内联排版标签），用于保存为自定义模板 */
  currentText: string;
}

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  onApply,
  currentText,
}) => {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset');
  const [customs, setCustoms] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomTemplate | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listCustomTemplates();
      setCustoms(list);
    } catch {
      toast.error('自定义模板加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 打开面板时拉取自定义模板列表
  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  // 保存当前编辑区内容（连同排版格式标签）为自定义模板
  const handleSave = async () => {
    const name = saveName.trim();
    if (!name) {
      toast.error('请输入模板名称');
      return;
    }
    if (currentText.trim() === '') {
      toast.error('当前无编辑内容，无法保存为模板');
      return;
    }
    setSaving(true);
    try {
      await createCustomTemplate(name, currentText);
      toast.success(`模板「${name}」已保存`);
      setSaveName('');
      await refresh();
    } catch {
      toast.error('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteCustomTemplate(deleteTarget.id);
      setCustoms((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success(`已删除模板「${deleteTarget.name}」`);
    } catch {
      toast.error('删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            模版库
          </DialogTitle>
          <DialogDescription>
            应用预设模版快速起步，或将当前排版保存为自定义模板随时复用
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'preset' | 'custom')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">预设模板</TabsTrigger>
            <TabsTrigger value="custom">自定义模板</TabsTrigger>
          </TabsList>

          <TabsContent value="preset">
            <div className="grid max-h-[52vh] grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2">
              {TEXT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onApply(tpl)}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/40"
                >
                  <span className="text-sm font-semibold text-foreground">{tpl.name}</span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {tpl.description}
                  </span>
                  <span className="mt-3 line-clamp-3 flex-1 whitespace-pre-wrap rounded bg-muted/50 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
                    {tpl.content}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            {/* 保存当前编辑区内容（连同排版格式）为自定义模板 */}
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-2">
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSave();
                }}
                maxLength={50}
                placeholder="输入模板名称，保存当前内容与排版格式"
                className="h-8 flex-1 px-2 text-xs"
              />
              <Button
                size="sm"
                className="h-8 shrink-0 gap-1.5 text-xs"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                保存为模板
              </Button>
            </div>

            <div className="max-h-[44vh] overflow-y-auto">
              {loading ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : customs.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-center">
                  <p className="text-sm text-muted-foreground">暂无自定义模板</p>
                  <p className="text-xs text-muted-foreground/70">
                    在上方输入名称，即可保存当前编辑区的内容与排版格式
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {customs.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 flex-col text-left"
                        onClick={() =>
                          onApply({
                            id: tpl.id,
                            name: tpl.name,
                            description: '自定义模板',
                            content: tpl.content,
                          })
                        }
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                            {tpl.name}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatTime(tpl.created_at)}
                          </span>
                        </span>
                        <span className="mt-3 line-clamp-3 flex-1 whitespace-pre-wrap rounded bg-muted/50 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
                          {tpl.content}
                        </span>
                      </button>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground/70">
                          点击卡片应用此模板
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-destructive"
                          disabled={deletingId === tpl.id}
                          onClick={() => setDeleteTarget(tpl)}
                        >
                          {deletingId === tpl.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 删除二次确认 */}
        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>删除自定义模板</AlertDialogTitle>
              <AlertDialogDescription>
                确认删除模板「{deleteTarget?.name}」吗？删除后不可恢复。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDelete()}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;