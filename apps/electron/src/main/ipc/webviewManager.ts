import {
  IpcChannels,
  IWebviewCreateParams,
  IWebviewUpdateUrlParams,
  IWebviewToggleDevToolsParams,
  IWebviewSetBoundsParams,
  IWebviewSetVisibleParams,
  IWebviewExecuteJavaScriptParams,
  IWebviewDestroyParams,
  IWebviewReloadParams,
  IWebviewOperationResult,
} from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import path from 'path';
import { getMainWindow } from '../mainWindow';
import { PLUGIN_VIEW_HEIGHT, SEARCH_HEIGHT, WINDOW_WIDTH, TOOLBAR_HEIGHT } from '@vkit/constants';

// Webview管理器 - 支持多个webview实例
const webviewManager = new Map<string, WebContentsView>();
let webviewCounter = 0;

/**
 * 创建webview
 */
const createWebview = (
  _event: IpcMainInvokeEvent,
  params: IWebviewCreateParams
): IWebviewOperationResult => {
  try {
    const win = getMainWindow();
    if (!win) {
      return { success: false, error: 'Main window not found' };
    }

    // 生成webview ID
    const webviewId = params.id ?? `webview-${++webviewCounter}`;

    // 如果ID已存在，先销毁旧的
    if (webviewManager.has(webviewId)) {
      const existingWebview = webviewManager.get(webviewId);
      if (existingWebview && !existingWebview.webContents.isDestroyed()) {
        existingWebview.webContents.close();
      }
      webviewManager.delete(webviewId);
    }

    // 创建webview配置
    const webPreferences: Electron.WebPreferences = {
      ...params.options,
      preload: params.options?.preload ?? path.join(__dirname, '../preload/index.js'),
    };

    // 创建webview
    const webview = new WebContentsView({
      webPreferences,
    });

    // 添加用户代理
    if (params.options?.userAgent) {
      webview.webContents.setUserAgent(params.options.userAgent);
    }

    // 设置边框圆角
    webview.setBorderRadius(params.borderRadius ?? 0);

    // 加载URL
    webview.webContents.loadURL(params.url);

    // 添加到主窗口
    win.contentView.addChildView(webview);

    // 设置位置和大小
    if (params.bounds) {
      webview.setBounds(params.bounds);
    } else {
      // 默认占据插件区域
      webview.setBounds({
        x: 0,
        y: SEARCH_HEIGHT,
        width: WINDOW_WIDTH,
        height: PLUGIN_VIEW_HEIGHT - TOOLBAR_HEIGHT,
      });
    }

    // 设置可见性
    if (params.visible === false) {
      webview.setVisible(false);
    }

    // 是否打开开发者工具
    if (params.openDevTools) {
      const mode = params.devToolsMode ?? 'detach';
      webview.webContents.openDevTools({ mode });
    }

    // 存储webview
    webviewManager.set(webviewId, webview);

    return {
      success: true,
      data: {
        id: webviewId,
        url: params.url,
        bounds: params.bounds,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 销毁webview
 */
const destroyWebview = (
  _event: IpcMainInvokeEvent,
  params?: IWebviewDestroyParams
): IWebviewOperationResult => {
  try {
    if (params?.id) {
      // 销毁指定ID的webview
      const webview = webviewManager.get(params.id);
      if (webview) {
        if (!webview.webContents.isDestroyed()) {
          webview.webContents.close();
        }
        webviewManager.delete(params.id);
        return { success: true };
      } else {
        return { success: false, error: `Webview with id '${params.id}' not found` };
      }
    } else {
      // 销毁默认webview（第一个）
      const firstEntry = webviewManager.entries().next().value;
      if (firstEntry) {
        const [id, webview] = firstEntry;
        if (!webview.webContents.isDestroyed()) {
          webview.webContents.close();
        }
        webviewManager.delete(id);
        return { success: true };
      } else {
        return { success: false, error: 'No webview found' };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 更新webview URL
 */
const updateWebviewUrl = (
  _event: IpcMainInvokeEvent,
  params: IWebviewUpdateUrlParams
): IWebviewOperationResult => {
  try {
    const webview = getWebviewById(params.id);
    if (webview && !webview.webContents.isDestroyed()) {
      webview.webContents.loadURL(params.url);
      return { success: true };
    }
    return { success: false, error: 'Webview not found' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 重载webview
 */
const reloadWebview = (
  _event: IpcMainInvokeEvent,
  params?: IWebviewReloadParams
): IWebviewOperationResult => {
  try {
    const webview = getWebviewById(params?.id);
    if (webview && !webview.webContents.isDestroyed()) {
      if (params?.ignoreCache) {
        webview.webContents.reloadIgnoringCache();
      } else {
        webview.webContents.reload();
      }
      return { success: true };
    }
    return { success: false, error: 'Webview not found' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 切换开发者工具
 */
const toggleWebviewDevTools = (
  _event: IpcMainInvokeEvent,
  params: IWebviewToggleDevToolsParams
): IWebviewOperationResult => {
  try {
    const webview = getWebviewById(params.id);
    if (webview && !webview.webContents.isDestroyed()) {
      if (params.enabled) {
        const mode = params.mode ?? 'detach';
        webview.webContents.openDevTools({ mode });
      } else {
        webview.webContents.closeDevTools();
      }
      return { success: true };
    }
    return { success: false, error: 'Webview not found' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 设置webview位置和大小
 */
const setWebviewBounds = (
  _event: IpcMainInvokeEvent,
  params: IWebviewSetBoundsParams
): IWebviewOperationResult => {
  try {
    const webview = getWebviewById(params.id);
    if (webview && !webview.webContents.isDestroyed()) {
      webview.setBounds(params.bounds);
      return { success: true };
    }
    return { success: false, error: 'Webview not found' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 设置webview可见性
 */
const setWebviewVisible = (
  _event: IpcMainInvokeEvent,
  params: IWebviewSetVisibleParams
): IWebviewOperationResult => {
  try {
    const webview = getWebviewById(params.id);
    if (webview && !webview.webContents.isDestroyed()) {
      webview.setVisible(params.visible);
      return { success: true };
    }
    return { success: false, error: 'Webview not found' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 执行JavaScript代码
 */
const executeWebviewJavaScript = async <T = unknown>(
  _event: IpcMainInvokeEvent,
  params: IWebviewExecuteJavaScriptParams
): Promise<IWebviewOperationResult<T>> => {
  try {
    const webview = getWebviewById(params.id);
    if (webview && !webview.webContents.isDestroyed()) {
      const result = (await webview.webContents.executeJavaScript(
        params.code,
        params.userGesture
      )) as T;
      return { success: true, data: result };
    }
    return { success: false, error: 'Webview not found' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * 根据ID获取webview，如果没有ID则返回第一个
 */
const getWebviewById = (id?: string): WebContentsView | null => {
  if (id) {
    return webviewManager.get(id) ?? null;
  } else {
    // 返回第一个webview
    const iterator = webviewManager.entries().next();
    return iterator.done ? null : iterator.value[1];
  }
};

/**
 * 清理所有webview
 */
export const cleanupAllWebviews = () => {
  webviewManager.forEach((webview, _id) => {
    if (!webview.webContents.isDestroyed()) {
      webview.webContents.close();
    }
  });
  webviewManager.clear();
};

/**
 * 设置webview管理IPC处理器
 */
export const setupWebviewManager = () => {
  ipcMain.handle(IpcChannels.WEBVIEW_CREATE, createWebview);
  ipcMain.handle(IpcChannels.WEBVIEW_DESTROY, destroyWebview);
  ipcMain.handle(IpcChannels.WEBVIEW_UPDATE_URL, updateWebviewUrl);
  ipcMain.handle(IpcChannels.WEBVIEW_RELOAD, reloadWebview);
  ipcMain.handle(IpcChannels.WEBVIEW_TOGGLE_DEV_TOOLS, toggleWebviewDevTools);
  ipcMain.handle(IpcChannels.WEBVIEW_SET_BOUNDS, setWebviewBounds);
  ipcMain.handle(IpcChannels.WEBVIEW_SET_VISIBLE, setWebviewVisible);
  ipcMain.handle(IpcChannels.WEBVIEW_EXECUTE_JAVASCRIPT, executeWebviewJavaScript);
};
