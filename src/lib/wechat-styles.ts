/**
 * 微信公众号排版样式库
 *
 * 所有样式均使用内联 style（公众号编辑器会剥离 class/外部样式表，
 * 仅保留内联样式），保证「复制到公众号」后排版不丢。
 * 主色调采用微信官方绿 #07c160 / 深绿 #1aad19，正文 #3f3f3f。
 */

export interface WechatStylePreset {
  id: string;
  name: string;
  /** 带内联样式的 HTML 片段，点击样式卡即插入编辑器 */
  html: string;
  /** 行内片段（如强调 span）：有选区时包裹选区；块级片段插入前折叠选区，避免误替换全文 */
  inline?: boolean;
}

export interface WechatStyleCategory {
  id: string;
  label: string;
  presets: WechatStylePreset[];
}

const T = '标题文字';

export const STYLE_CATEGORIES: WechatStyleCategory[] = [
  {
    id: 'heading',
    label: '标题',
    presets: [
      {
        id: 'h-number',
        name: '序号标题',
        html: `<section style="margin:28px 0 18px;border-bottom:1px solid #e5e5e5;padding-bottom:10px;"><span style="font-size:20px;font-weight:700;color:#07c160;margin-right:10px;">01</span><span style="font-size:17px;font-weight:700;color:#3f3f3f;">${T}</span></section>`,
      },
      {
        id: 'h-block',
        name: '色块标题',
        html: `<section style="margin:28px 0 18px;"><span style="display:inline-block;background:#07c160;color:#ffffff;font-size:15px;font-weight:600;line-height:1;padding:8px 14px;border-radius:4px;">${T}</span></section>`,
      },
      {
        id: 'h-border-left',
        name: '竖线标题',
        html: `<section style="margin:28px 0 18px;border-left:4px solid #07c160;padding-left:12px;font-size:17px;font-weight:700;color:#3f3f3f;line-height:1.4;">${T}</section>`,
      },
      {
        id: 'h-center',
        name: '居中装饰标题',
        html: `<section style="margin:28px 0 18px;text-align:center;font-size:17px;font-weight:700;color:#3f3f3f;"><span style="color:#07c160;">◆ </span>${T}<span style="color:#07c160;"> ◆</span></section>`,
      },
      {
        id: 'h-sub',
        name: '居中副标题',
        html: `<section style="margin:16px 0;text-align:center;font-size:13px;color:#999999;letter-spacing:2px;">— 副标题文字 —</section>`,
      },
    ],
  },
  {
    id: 'paragraph',
    label: '正文 / 卡片',
    presets: [
      {
        id: 'p-default',
        name: '标准段落',
        html: `<section style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#3f3f3f;text-align:justify;">在这里输入正文内容，建议段落之间保持适当留白，阅读体验更佳。</section>`,
      },
      {
        id: 'p-indent',
        name: '首行缩进段落',
        html: `<section style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#3f3f3f;text-align:justify;text-indent:2em;">在这里输入正文内容，首行缩进两个字符，是纸媒时代延续下来的经典排版习惯。</section>`,
      },
      {
        id: 'p-card',
        name: '灰底卡片',
        html: `<section style="margin:0 0 20px;padding:16px;background:#f7f7f7;border-radius:8px;font-size:15px;line-height:1.8;color:#3f3f3f;text-align:justify;">正文内容放在灰色卡片中，与普通段落形成视觉区隔，适合放置核心观点。</section>`,
      },
      {
        id: 'p-tip',
        name: '绿色提示框',
        html: `<section style="margin:0 0 20px;padding:14px 16px;background:#f0fbf4;border-left:3px solid #07c160;border-radius:4px;font-size:14px;line-height:1.8;color:#1aad19;">提示文字：这里适合放置注意事项、操作指引或关键结论。</section>`,
      },
      {
        id: 'p-note',
        name: '黄色便签',
        html: `<section style="margin:0 0 20px;padding:14px 16px;background:#fffbe6;border:1px solid #ffe58f;border-radius:6px;font-size:14px;line-height:1.8;color:#8c6d1f;">便签内容：这里适合放置补充说明、小贴士或温馨提示。</section>`,
      },
    ],
  },
  {
    id: 'quote',
    label: '引用',
    presets: [
      {
        id: 'q-gray',
        name: '灰线引用',
        html: `<section style="margin:0 0 20px;padding:12px 16px;border-left:3px solid #d9d9d9;background:#fafafa;font-size:14px;line-height:1.8;color:#888888;">引用内容：名人名言、读者来信或需要注明出处的文字。</section>`,
      },
      {
        id: 'q-green',
        name: '绿色引用卡',
        html: `<section style="margin:0 0 20px;padding:14px 16px;background:#f0fbf4;border-radius:8px;font-size:14px;line-height:1.8;color:#1a7f37;">“引用文字：换一种颜色的引用卡片，让文风更活泼。”</section>`,
      },
    ],
  },
  {
    id: 'divider',
    label: '分割线',
    presets: [
      {
        id: 'd-gradient',
        name: '渐隐分割线',
        html: `<section style="margin:28px 0;height:1px;background:linear-gradient(to right, rgba(0,0,0,0), #7f7f7f, rgba(0,0,0,0));"></section>`,
      },
      {
        id: 'd-dots',
        name: '间隔点',
        html: `<section style="margin:28px 0;text-align:center;color:#cccccc;font-size:12px;letter-spacing:8px;">• • •</section>`,
      },
      {
        id: 'd-bar',
        name: '绿色短横',
        html: `<section style="margin:28px 0;text-align:center;"><span style="display:inline-block;width:32px;height:3px;background:#07c160;border-radius:2px;"></span></section>`,
      },
    ],
  },
  {
    id: 'guide',
    label: '引导模块',
    presets: [
      {
        id: 'g-follow',
        name: '顶部关注引导',
        html: `<section style="margin:0 0 24px;padding:14px 16px;background:#f0fbf4;border-radius:10px;text-align:center;font-size:14px;color:#1aad19;line-height:1.7;">点击上方蓝字「公众号名称」→ 右上角 <span style="font-weight:700;">…</span> → 设为 <span style="font-weight:700;">星标</span></section>`,
      },
      {
        id: 'g-footer',
        name: '文末求赞',
        html: `<section style="margin:28px 0 8px;padding:16px;background:#f7f7f7;border-radius:10px;text-align:center;font-size:13px;color:#888888;line-height:1.8;">如果这篇文章对你有帮助<br>欢迎 <span style="color:#fa5151;font-weight:600;">点赞</span>、<span style="color:#10aeff;font-weight:600;">在看</span>、转发分享</section>`,
      },
      {
        id: 'g-sign',
        name: '作者签名',
        html: `<section style="margin:28px 0 4px;text-align:right;font-size:13px;color:#999999;">—— 作者名 · 写于 2026 年 11 月</section>`,
      },
    ],
  },
  {
    id: 'emphasis',
    label: '行内强调',
    presets: [
      {
        id: 'e-highlight',
        name: '高亮标注',
        inline: true,
        html: `<span style="background:#fffbe6;border-bottom:2px solid #ffc300;padding:0 2px;">重点内容</span>`,
      },
      {
        id: 'e-green',
        name: '绿色加粗',
        inline: true,
        html: `<span style="color:#1aad19;font-weight:700;">关键文字</span>`,
      },
      {
        id: 'e-red',
        name: '红色加粗',
        inline: true,
        html: `<span style="color:#e64340;font-weight:700;">关键文字</span>`,
      },
    ],
  },
];

/** 新建空白图文时的示例文章 */
export const DEFAULT_ARTICLE = [
  `<section style="margin:0 0 8px;text-align:center;font-size:22px;font-weight:700;color:#3f3f3f;line-height:1.4;">这里是文章标题</section>`,
  `<section style="margin:0 0 24px;text-align:center;font-size:13px;color:#999999;">作者名 · 2026-11-10</section>`,
  STYLE_CATEGORIES[4].presets[0].html.replace('公众号名称', '编码叶'),
  `<section style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#3f3f3f;text-align:justify;">打开左侧样式库，点击任意样式卡即可插入；选中文字后用上方工具栏调整加粗、颜色与对齐。编辑完成后点右上角「复制到公众号」，再到公众号后台编辑器直接粘贴即可。</section>`,
  STYLE_CATEGORIES[0].presets[0].html.replace('01', '01').replace(T, '为什么排版很重要'),
  `<section style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#3f3f3f;text-align:justify;">统一、舒适的排版能让读者把注意力放在内容本身。全文建议只使用 1～2 种主色调，字号 14～16px，行距 1.75～2 倍，段间距大于行间距。</section>`,
  STYLE_CATEGORIES[2].presets[0].html.replace('引用内容：名人名言、读者来信或需要注明出处的文字。', '排版是内容的一部分，好的排版自己会说话。'),
  STYLE_CATEGORIES[1].presets[3].html.replace('提示文字：这里适合放置注意事项、操作指引或关键结论。', '小贴士：复制到公众号后，仍然可以在公众号编辑器里继续微调。'),
  STYLE_CATEGORIES[3].presets[1].html,
  STYLE_CATEGORIES[4].presets[1].html,
].join('\n');
