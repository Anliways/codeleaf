export interface TextTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    id: 'title-body',
    name: '标题 + 正文',
    description: '经典文章结构，标题、副标题与段落正文组合',
    content: `# 文档标题

## 概述

在此输入正文内容，支持<b>加粗</b>、<i>斜体</i>、<u>下划线</u>等格式。

## 要点

1. 第一个要点
2. 第二个要点
3. 第三个要点`,
  },
  {
    id: 'card',
    name: '卡片布局',
    description: '卡片容器，适合模块化展示产品或信息',
    content: `::: card 产品介绍
# 产品名称

简短描述产品特性，突出核心价值。

- 特性一
- 特性二
- 特性三
:::`,
  },
  {
    id: 'columns',
    name: '多栏排版',
    description: '双栏并排内容，适合对比或并列展示',
    content: `# 多栏排版示例

::: columns
左栏内容：在此输入第一栏的文字，支持富文本格式与列表。

右栏内容：在此输入第二栏的文字，与左栏并排展示。
:::`,
  },
  {
    id: 'announcement',
    name: '公告通知',
    description: '居中对齐的公告样式，突出重点信息',
    content: `:center # 重要公告

:center 本通知适用于全体成员，请仔细阅读以下内容。

:center - 事项一
:center - 事项二
:center - 事项三`,
  },
  {
    id: 'feature-list',
    name: '功能清单',
    description: '罗马数字与阿拉伯数字混合的有序列表',
    content: `# 功能清单

i. 基础编辑
ii. 格式排版
iii. 预览导出

## 详细说明

1. 支持撤销重做
2. 支持字体与背景设置
3. 支持预设模版库`,
  },
  {
    id: 'rich-text',
    name: '富文本示例',
    description: '展示加粗、颜色、字号、上下标等综合排版',
    content: `# 富文本排版

这是一段<color=#3b82f6>蓝色</color>的文字，其中包含<b>加粗</b>与<i>斜体</i>。

化学式 H<sub>2</sub>O 与数学式 X<sup>2</sup> + Y<sup>2</sup>。

<spacing=3>宽间距文字效果</spacing>，<lh=2>更大行距让段落呼吸</lh>。`,
  },
];