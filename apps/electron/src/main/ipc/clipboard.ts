import { ipcMain } from 'electron';
import { clipboardService } from '../service/clipboardService';
import { IpcChannels, type IClipboardOperationResult, type IClipboardEntry } from '@vkit/api';
import { getPluginView } from './pluginView';

/**
 * 获取剪切板历史记录的IPC处理器
 */
const handleGetHistory = (): IClipboardOperationResult<IClipboardEntry[]> => {
  return clipboardService.getHistory();
};

/**
 * 删除剪切板历史记录的IPC处理器
 */
const handleDeleteHistory = (_event: unknown, id: string): IClipboardOperationResult<void> => {
  return clipboardService.deleteHistory(id);
};

/**
 * 更新剪切板历史记录的IPC处理器
 */
const handleUpdateHistory = (
  _event: unknown,
  id: string,
  content: string
): IClipboardOperationResult<void> => {
  return clipboardService.updateHistory(id, content);
};

/**
 * 切换剪切板收藏状态的IPC处理器
 */
const handleToggleFavorite = (_event: unknown, id: string): IClipboardOperationResult<void> => {
  return clipboardService.toggleFavorite(id);
};

/**
 * 删除所有剪切板历史记录的IPC处理器
 */
const handleDeleteAllHistory = (): IClipboardOperationResult<void> => {
  return clipboardService.deleteAllHistory();
};

/**
 * 设置剪切板服务的IPC处理器
 */
export function setupClipboardIpc(): void {
  ipcMain.handle(IpcChannels.CLIPBOARD_GET_HISTORY, handleGetHistory);
  ipcMain.handle(IpcChannels.CLIPBOARD_DELETE_HISTORY, handleDeleteHistory);
  ipcMain.handle(IpcChannels.CLIPBOARD_UPDATE_HISTORY, handleUpdateHistory);
  ipcMain.handle(IpcChannels.CLIPBOARD_TOGGLE_FAVORITE, handleToggleFavorite);
  ipcMain.handle(IpcChannels.CLIPBOARD_DELETE_ALL_HISTORY, handleDeleteAllHistory);
  clipboardService.on(IpcChannels.CLIPBOARD_CHANGED, () => {
    getPluginView()?.webContents.send(IpcChannels.CLIPBOARD_CHANGED);
  });
}

/**
 * 初始化剪切板服务
 */
export function initializeClipboardService(): void {
  clipboardService.initialize();
}

/**
 * 销毁剪切板服务
 */
export function destroyClipboardService(): void {
  clipboardService.destroy();
}
