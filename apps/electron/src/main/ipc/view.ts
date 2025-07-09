import { is } from '@electron-toolkit/utils';
import { IpcChannels, IPluginManifest, ISearchInputChangeEvent, ISearchInputEnterEvent, IPluginInitData } from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import path from 'path';
import { getMainWindow } from '../mainWindow';
import { PLUGIN_VIEW_HEIGHT, SEARCH_HEIGHT, WINDOW_WIDTH } from '@vkit/constants';

let view: WebContentsView | null = null;

const createPluginView = (_event: IpcMainInvokeEvent, manifest: IPluginManifest, initData?: IPluginInitData) => {
  if (view) {
    view.webContents.close();
  }
  view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  view.setBorderRadius(0);

  const win = getMainWindow();
  const id = manifest.id;
  const entry = manifest.entry ?? 'index.html';
  let entryPath: string;
  if (is.dev) {
    entryPath = path.resolve(__dirname, `../../../../features/${id}/dist`, entry);
  } else {
    entryPath = path.resolve(__dirname, `../features/${id}`, entry);
  }
  view.webContents.loadFile(entryPath);
  win?.contentView.addChildView(view);
  view.webContents.on('did-finish-load', () => {
    win?.setSize(WINDOW_WIDTH, SEARCH_HEIGHT + PLUGIN_VIEW_HEIGHT);
    view?.setBounds({ x: 0, y: SEARCH_HEIGHT, width: WINDOW_WIDTH, height: PLUGIN_VIEW_HEIGHT });
    view?.webContents.openDevTools({ mode: 'detach' });
    
    // 如果有初始化数据，发送给插件
    if (initData && view && !view.webContents.isDestroyed()) {
      view.webContents.send(IpcChannels.PLUGIN_INIT_DATA, initData);
    }
  });
};

const closePluginView = () => {
  if (view) {
    view.webContents.close();
    view = null;
  }
};

const handleSearchInputChange = (_event: IpcMainInvokeEvent, data: ISearchInputChangeEvent) => {
  if (view && !view.webContents.isDestroyed()) {
    view.webContents.send(IpcChannels.SEARCH_INPUT_CHANGE, data);
  }
};

const handleSearchInputEnter = (_event: IpcMainInvokeEvent, data: ISearchInputEnterEvent) => {
  if (view && !view.webContents.isDestroyed()) {
    view.webContents.send(IpcChannels.SEARCH_INPUT_ENTER, data);
  }
};

export const setupView = () => {
  ipcMain.handle(IpcChannels.CREATE_PLUGIN_VIEW, createPluginView);
  ipcMain.handle(IpcChannels.CLOSE_PLUGIN_VIEW, closePluginView);
  ipcMain.handle(IpcChannels.SEARCH_INPUT_CHANGE, handleSearchInputChange);
  ipcMain.handle(IpcChannels.SEARCH_INPUT_ENTER, handleSearchInputEnter);
};
