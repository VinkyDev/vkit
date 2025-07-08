import { IpcChannels, IWindowSetSizeParams } from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { getMainWindow } from '../mainWindow';

const setWindowSize = (_event: IpcMainInvokeEvent, params: IWindowSetSizeParams) => {
  const win = getMainWindow();
  if (win) {
    win.setSize(params.width, params.height);
  }
};

const showWindow = () => {
  const win = getMainWindow();
  if (win) {
    win.show();
  }
};

const hideWindow = () => {
  const win = getMainWindow();
  if (win) {
    win.hide();
  }
};

export const setupWindow = () => {
  ipcMain.handle(IpcChannels.SET_WINDOW_SIZE, setWindowSize);

  ipcMain.handle(IpcChannels.SHOW_WINDOW, showWindow);

  ipcMain.handle(IpcChannels.HIDE_WINDOW, hideWindow);
};
