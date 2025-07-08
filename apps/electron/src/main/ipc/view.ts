import { is } from '@electron-toolkit/utils';
import { IpcChannels, IPluginManifest } from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import path from 'path';
import { getMainWindow } from '../mainWindow';
import { PLUGIN_VIEW_HEIGHT, SEARCH_HEIGHT, WINDOW_WIDTH } from '@vkit/constants';

let view: WebContentsView | null = null;

const createPluginView = (_event: IpcMainInvokeEvent, manifest: IPluginManifest) => {
  if (view) {
    view.webContents.close();
  }
  view = new WebContentsView();
  view.setBorderRadius(0);

  const win = getMainWindow();
  const id = manifest.id;
  const entry = manifest.entry ?? 'index.html';
  let entryPath: string;
  if (is.dev) {
    entryPath = path.resolve(__dirname, `../../../../features/${id}/dist`, entry);
  } else {
    entryPath = path.resolve(__dirname, `../../features/${id}`, entry);
  }
  view.webContents.loadFile(entryPath);
  win?.contentView.addChildView(view);
  view.webContents.on('did-finish-load', () => {
    win?.setSize(WINDOW_WIDTH, SEARCH_HEIGHT + PLUGIN_VIEW_HEIGHT);
    view?.setBounds({ x: 0, y: SEARCH_HEIGHT, width: WINDOW_WIDTH, height: PLUGIN_VIEW_HEIGHT });
    view?.webContents.openDevTools({ mode: 'detach' });
  });
};

const closePluginView = () => {
  if (view) {
    view.webContents.close();
    view = null;
  }
};

export const setupView = () => {
  ipcMain.handle(IpcChannels.CREATE_PLUGIN_VIEW, createPluginView);
  ipcMain.handle(IpcChannels.CLOSE_PLUGIN_VIEW, closePluginView);
};
