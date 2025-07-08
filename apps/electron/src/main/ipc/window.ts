import { IpcChannels, IWindowSetSizeParams } from '@vkit/api';
import { BrowserWindow, ipcMain } from 'electron';

export const setupWindow = () => {
  ipcMain.handle(IpcChannels.SET_WINDOW_SIZE, (_, { width, height }: IWindowSetSizeParams) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setSize(width, height);
    }
  });
};
