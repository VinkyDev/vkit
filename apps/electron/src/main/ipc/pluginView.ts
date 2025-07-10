import { is } from '@electron-toolkit/utils';
import {
  IpcChannels,
  IPluginManifest,
  ISearchInputChangeEvent,
  ISearchInputEnterEvent,
  IPluginInitData,
} from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent, LoadFileOptions, WebContentsView } from 'electron';
import path from 'path';
import { getMainWindow } from '../mainWindow';
import { PLUGIN_VIEW_HEIGHT, SEARCH_HEIGHT, WINDOW_WIDTH } from '@vkit/constants';
import { cleanupAllWebviews } from './webviewManager';

// 插件视图
let pluginView: WebContentsView | null = null;

/**
 * 创建插件视图
 */
const createPluginView = (
  _event: IpcMainInvokeEvent,
  manifest: IPluginManifest,
  initData?: IPluginInitData
) => {
  if (pluginView) {
    pluginView.webContents.close();
  }

  pluginView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  pluginView.setBackgroundColor('#00000000');
  pluginView.setBorderRadius(0);

  const win = getMainWindow();
  const id = manifest.id;
  const entry = manifest.entry ?? 'index.html';
  let entryPath: string;

  if (is.dev) {
    entryPath = path.resolve(__dirname, `../../../../features/${id}/dist`, entry);
  } else {
    entryPath = path.resolve(__dirname, `../features/${id}`, entry);
  }

  const loadOptions: LoadFileOptions = {};
  if (initData) {
    loadOptions.query = {
      initData: encodeURIComponent(JSON.stringify(initData)),
    };
  }

  pluginView.webContents.loadFile(entryPath, loadOptions);
  win?.contentView.addChildView(pluginView);

  pluginView.webContents.on('did-finish-load', () => {
    win?.setSize(WINDOW_WIDTH, SEARCH_HEIGHT + PLUGIN_VIEW_HEIGHT);
    pluginView?.setBounds({
      x: 0,
      y: SEARCH_HEIGHT,
      width: WINDOW_WIDTH,
      height: PLUGIN_VIEW_HEIGHT,
    });
  });
};

/**
 * 关闭插件视图
 */
export const closePluginView = () => {
  // 先清理所有webview
  cleanupAllWebviews();

  if (pluginView) {
    pluginView.webContents.close();
    pluginView = null;
    
    // 通知主窗口插件视图已关闭
    const mainWindow = getMainWindow();
    if (mainWindow && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.send(IpcChannels.PLUGIN_VIEW_CLOSED);
    }
  }
};

/**
 * 处理搜索输入变化事件
 */
const handleSearchInputChange = (_event: IpcMainInvokeEvent, data: ISearchInputChangeEvent) => {
  if (pluginView && !pluginView.webContents.isDestroyed()) {
    pluginView.webContents.send(IpcChannels.SEARCH_INPUT_CHANGE, data);
  }
};

/**
 * 处理搜索输入回车事件
 */
const handleSearchInputEnter = (_event: IpcMainInvokeEvent, data: ISearchInputEnterEvent) => {
  if (pluginView && !pluginView.webContents.isDestroyed()) {
    pluginView.webContents.send(IpcChannels.SEARCH_INPUT_ENTER, data);
  }
};

/**
 * 获取当前是否有活跃的插件视图
 */
export const hasActivePluginView = (): boolean => {
  return pluginView !== null && !pluginView.webContents.isDestroyed();
};

/**
 * 设置插件视图IPC处理器
 */
export const setupPluginView = () => {
  ipcMain.handle(IpcChannels.CREATE_PLUGIN_VIEW, createPluginView);
  ipcMain.handle(IpcChannels.CLOSE_PLUGIN_VIEW, closePluginView);
  ipcMain.handle(IpcChannels.SEARCH_INPUT_CHANGE, handleSearchInputChange);
  ipcMain.handle(IpcChannels.SEARCH_INPUT_ENTER, handleSearchInputEnter);
};
