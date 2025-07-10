import { IpcChannels } from '../ipcChannels';
import type {
  IWindowSetSizeParams,
  IGlobalShortcutParams,
  IGlobalShortcutResponse,
} from '../types';

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

/**
 * 切换主窗口显示状态
 *
 * @example
 * ```typescript
 * // 切换窗口显示/隐藏
 * await toggleWindow();
 * ```
 */
export const toggleWindow = async (): Promise<void> => {
  await window?.electron?.ipcRenderer?.invoke(IpcChannels.TOGGLE_WINDOW);
};

// ============================================================================
// 全局快捷键管理 API
// ============================================================================

/**
 * 设置全局快捷键
 * @param shortcut 快捷键组合字符串
 *
 * @example
 * ```typescript
 * // 设置默认快捷键
 * const result = await setGlobalShortcut('Shift+Space');
 * if (result.success) {
 *   console.log('快捷键设置成功');
 * } else {
 *   console.error('设置失败:', result.error);
 * }
 *
 * // 设置其他快捷键
 * await setGlobalShortcut('Ctrl+Alt+V');
 * await setGlobalShortcut('Command+Space'); // macOS
 * ```
 */
export const setGlobalShortcut = async (shortcut: string): Promise<IGlobalShortcutResponse> => {
  return (await window?.electron?.ipcRenderer?.invoke(IpcChannels.SET_GLOBAL_SHORTCUT, {
    shortcut,
  } as IGlobalShortcutParams)) as IGlobalShortcutResponse;
};

/**
 * 获取当前全局快捷键设置
 *
 * @example
 * ```typescript
 * const result = await getGlobalShortcut();
 * console.log('当前快捷键:', result.shortcut);
 * ```
 */
export const getGlobalShortcut = async (): Promise<IGlobalShortcutResponse> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.GET_GLOBAL_SHORTCUT
  )) as IGlobalShortcutResponse;
};
