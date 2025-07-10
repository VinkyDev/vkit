import { IpcChannels } from '../ipcChannels';
import type { IWindowSetSizeParams } from '../types';

// ============================================================================
// 窗口管理 API
// ============================================================================

/**
 * 设置窗口大小
 * @param params 窗口尺寸参数
 * 
 * @example
 * ```typescript
 * // 设置窗口为800x600
 * await setWindowSize({ width: 800, height: 600 });
 * ```
 */
export const setWindowSize = async (params: IWindowSetSizeParams): Promise<void> => {
  await window.electron.ipcRenderer.invoke(IpcChannels.SET_WINDOW_SIZE, params);
};

/**
 * 显示主窗口
 * 
 * @example
 * ```typescript
 * // 显示已隐藏的窗口
 * await showWindow();
 * ```
 */
export const showWindow = async (): Promise<void> => {
  await window?.electron?.ipcRenderer?.invoke(IpcChannels.SHOW_WINDOW);
};

/**
 * 隐藏主窗口
 * 
 * @example
 * ```typescript
 * // 隐藏当前窗口
 * await hideWindow();
 * ```
 */
export const hideWindow = async (): Promise<void> => {
  await window?.electron?.ipcRenderer?.invoke(IpcChannels.HIDE_WINDOW);
}; 