export type PresetCategory = 'phone' | 'foldable' | 'ultrawide' | 'tablet' | 'desktop' | 'aspect';

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: PresetCategory;
  ratio?: string;
  custom?: boolean;
}

export const BUILT_IN_PRESETS: DevicePreset[] = [
  // 直屏手机
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, category: 'phone', ratio: '9:16' },
  { id: 'iphone-15', name: 'iPhone 15', width: 393, height: 852, category: 'phone', ratio: '9:19.5' },
  { id: 'iphone-15-promax', name: 'iPhone 15 Pro Max', width: 430, height: 932, category: 'phone', ratio: '9:19.5' },
  { id: 'pixel-8', name: 'Pixel 8', width: 412, height: 915, category: 'phone', ratio: '9:20' },
  { id: 'galaxy-s24', name: 'Galaxy S24', width: 360, height: 780, category: 'phone', ratio: '9:19.5' },
  { id: 'phone-55', name: '5.5英寸手机', width: 360, height: 640, category: 'phone', ratio: '9:16' },
  // 折叠屏
  { id: 'mate-xt', name: '三折叠屏（展开）', width: 1080, height: 2232, category: 'foldable', ratio: '9:18.6' },
  { id: 'z-fold6', name: '横折叠屏（展开）', width: 1856, height: 2160, category: 'foldable', ratio: '6:7' },
  // 带鱼屏
  { id: 'ultrawide-219', name: '21:9 带鱼屏', width: 2560, height: 1080, category: 'ultrawide', ratio: '21:9' },
  { id: 'ultrawide-329', name: '32:9 超宽带鱼屏', width: 3840, height: 1080, category: 'ultrawide', ratio: '32:9' },
  // 平板
  { id: 'ipad-mini', name: 'iPad mini', width: 768, height: 1024, category: 'tablet', ratio: '3:4' },
  { id: 'ipad', name: 'iPad', width: 820, height: 1180, category: 'tablet', ratio: '3:4' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet', ratio: '3:4' },
  { id: 'ipad-pro-13', name: 'iPad Pro 13"', width: 1024, height: 1366, category: 'tablet', ratio: '3:4' },
  // 桌面显示器
  { id: 'desktop-xga', name: '1024 × 768', width: 1024, height: 768, category: 'desktop', ratio: '4:3' },
  { id: 'desktop-hd', name: '1366 × 768', width: 1366, height: 768, category: 'desktop', ratio: '16:9' },
  { id: 'desktop-macbook', name: '1440 × 900', width: 1440, height: 900, category: 'desktop', ratio: '16:10' },
  { id: 'desktop-fullhd', name: '1920 × 1080', width: 1920, height: 1080, category: 'desktop', ratio: '16:9' },
  // 常见宽高比
  { id: 'aspect-169', name: '16:9', width: 1280, height: 720, category: 'aspect', ratio: '16:9' },
  { id: 'aspect-189', name: '18:9', width: 1440, height: 720, category: 'aspect', ratio: '18:9' },
  { id: 'aspect-219', name: '21:9', width: 1680, height: 720, category: 'aspect', ratio: '21:9' },
  { id: 'aspect-43', name: '4:3', width: 1024, height: 768, category: 'aspect', ratio: '4:3' },
  { id: 'aspect-11', name: '1:1', width: 1080, height: 1080, category: 'aspect', ratio: '1:1' },
];

export const CATEGORY_ORDER: PresetCategory[] = [
  'phone',
  'foldable',
  'ultrawide',
  'tablet',
  'desktop',
  'aspect',
];

export const CATEGORY_LABELS: Record<PresetCategory | 'custom', string> = {
  phone: '直屏手机',
  foldable: '折叠屏',
  ultrawide: '带鱼屏',
  tablet: '平板',
  desktop: '桌面显示器',
  aspect: '常见宽高比',
  custom: '自定义预设',
};
// 默认画布预设：iPhone SE（375×667 逻辑像素）
export const DEFAULT_PRESET_ID = 'iphone-se';
