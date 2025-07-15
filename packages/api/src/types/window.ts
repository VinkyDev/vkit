// ============================================================================
// 窗口相关类型定义
// ============================================================================

/**
 * 设置窗口大小的参数
 */
export interface IWindowSetSizeParams {
  width: number;
  height: number;
}

/**
 * 全局快捷键参数
 */
export interface IGlobalShortcutParams {
  shortcut: string;
}

/**
 * 全局快捷键响应
 */
export interface IGlobalShortcutResponse {
  shortcut: string;
  success: boolean;
  error?: string;
} 