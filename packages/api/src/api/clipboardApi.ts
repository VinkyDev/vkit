import { IpcChannels } from '../ipcChannels';
import type { IClipboardEntry, IClipboardOperationResult } from '../types';

// ============================================================================
// Clipboard 剪切板服务 API
// ============================================================================

/**
 * 获取剪切板历史记录
 * @returns 操作结果，包含剪切板历史记录数组
 *
 * @example
 * ```typescript
 * const result = await getClipboardHistory();
 * if (result.success) {
 *   console.log('剪切板历史记录:', result.data);
 *   result.data?.forEach(entry => {
 *     console.log(`${entry.type}: ${entry.content.substring(0, 50)}...`);
 *   });
 * }
 * ```
 */
export const getClipboardHistory = async (): Promise<
  IClipboardOperationResult<IClipboardEntry[]>
> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CLIPBOARD_GET_HISTORY
  )) as IClipboardOperationResult<IClipboardEntry[]>;
};

/**
 * 删除剪切板历史记录条目
 * @param id 要删除的条目ID
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * const result = await deleteClipboardHistory('entry-id-123');
 * if (result.success) {
 *   console.log('删除成功');
 * } else {
 *   console.error('删除失败:', result.error);
 * }
 * ```
 */
export const deleteClipboardHistory = async (
  id: string
): Promise<IClipboardOperationResult<void>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CLIPBOARD_DELETE_HISTORY,
    id
  )) as IClipboardOperationResult<void>;
};

/**
 * 更新剪切板历史记录条目内容
 * @param id 要更新的条目ID
 * @param content 新的内容
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * const result = await updateClipboardHistory('entry-id-123', '新的文本内容');
 * if (result.success) {
 *   console.log('更新成功');
 * } else {
 *   console.error('更新失败:', result.error);
 * }
 * ```
 */
export const updateClipboardHistory = async (
  id: string,
  content: string
): Promise<IClipboardOperationResult<void>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CLIPBOARD_UPDATE_HISTORY,
    id,
    content
  )) as IClipboardOperationResult<void>;
};

/**
 * 切换剪切板历史记录条目的收藏状态
 * @param id 要切换收藏状态的条目ID
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * const result = await toggleClipboardFavorite('entry-id-123');
 * if (result.success) {
 *   console.log('收藏状态切换成功');
 * } else {
 *   console.error('操作失败:', result.error);
 * }
 * ```
 */
export const toggleClipboardFavorite = async (
  id: string
): Promise<IClipboardOperationResult<void>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CLIPBOARD_TOGGLE_FAVORITE,
    id
  )) as IClipboardOperationResult<void>;
};

/**
 * 监听剪切板变化事件
 * @param callback 剪切板变化时的回调函数
 * @returns 取消监听的函数
 *
 * @example
 * ```typescript
 * // 监听剪切板变化
 * const unsubscribe = onClipboardChanged(() => {
 *   console.log('剪切板内容已变化，重新获取历史记录');
 *   getClipboardHistory().then(result => {
 *     if (result.success) {
 *       // 更新UI显示
 *       updateClipboardUI(result.data);
 *     }
 *   });
 * });
 *
 * // 在组件卸载时取消监听
 * // unsubscribe();
 * ```
 */
export const onClipboardChanged = (callback: () => void) => {
  const listener = () => {
    callback();
  };

  return window?.electron?.ipcRenderer?.on(IpcChannels.CLIPBOARD_CHANGED, listener);
};

/**
 * 删除所有剪切板历史记录
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * const result = await deleteAllClipboardHistory();
 * if (result.success) {
 *   console.log('删除成功');
 * }
 * ```
 */
export const deleteAllClipboardHistory = async (): Promise<IClipboardOperationResult<void>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CLIPBOARD_DELETE_ALL_HISTORY
  )) as IClipboardOperationResult<void>;
};