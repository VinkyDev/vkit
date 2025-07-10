import { globalShortcut, ipcMain, IpcMainInvokeEvent } from 'electron';
import { IpcChannels, IGlobalShortcutParams, IGlobalShortcutResponse } from '@vkit/api';
import { toggleMainWindow } from '../mainWindow';
import { closePluginView, hasActivePluginView } from './pluginView';

// 默认快捷键
const DEFAULT_SHORTCUT = 'Shift+Space';

// 当前注册的快捷键
let currentShortcut = DEFAULT_SHORTCUT;

/**
 * 注册全局快捷键
 */
const registerGlobalShortcut = (shortcut: string = DEFAULT_SHORTCUT): IGlobalShortcutResponse => {
  try {
    // 如果已有快捷键，先取消注册
    if (currentShortcut && globalShortcut.isRegistered(currentShortcut)) {
      globalShortcut.unregister(currentShortcut);
    }

    // 注册新的快捷键
    const success = globalShortcut.register(shortcut, () => {
      toggleMainWindow();
    });

    if (success) {
      currentShortcut = shortcut;
      return {
        shortcut,
        success: true,
      };
    } else {
      return {
        shortcut,
        success: false,
        error: '快捷键已被其他应用程序占用',
      };
    }
  } catch (error) {
    return {
      shortcut,
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
};

/**
 * 设置全局快捷键
 */
const setGlobalShortcut = (
  _event: IpcMainInvokeEvent,
  params: IGlobalShortcutParams
): IGlobalShortcutResponse => {
  return registerGlobalShortcut(params.shortcut);
};

/**
 * 获取当前全局快捷键
 */
const getGlobalShortcut = (): IGlobalShortcutResponse => {
  return {
    shortcut: currentShortcut,
    success: true,
  };
};

/**
 * 切换主窗口显示状态
 */
const handleToggleWindow = (): void => {
  toggleMainWindow();
};

/**
 * 初始化全局快捷键
 */
export const initGlobalShortcut = (): void => {
  // 注册默认的显示/隐藏快捷键
  registerGlobalShortcut(DEFAULT_SHORTCUT);

  // 注册ESC快捷键关闭插件视图
  globalShortcut.register('Escape', () => {
    if (hasActivePluginView()) {
      closePluginView();
    }
  });
};

/**
 * 清理全局快捷键
 */
export const cleanupGlobalShortcut = (): void => {
  // 清理主快捷键
  if (currentShortcut && globalShortcut.isRegistered(currentShortcut)) {
    globalShortcut.unregister(currentShortcut);
  }

  // 清理ESC快捷键
  if (globalShortcut.isRegistered('Escape')) {
    globalShortcut.unregister('Escape');
  }
};

/**
 * 设置全局快捷键IPC处理器
 */
export const setupGlobalShortcut = (): void => {
  ipcMain.handle(IpcChannels.SET_GLOBAL_SHORTCUT, setGlobalShortcut);
  ipcMain.handle(IpcChannels.GET_GLOBAL_SHORTCUT, getGlobalShortcut);
  ipcMain.handle(IpcChannels.TOGGLE_WINDOW, handleToggleWindow);
};
