/**
 * 数据库表类型定义
 * profiles 表：用户资料（与 AuthContext 配合使用）
 */

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
