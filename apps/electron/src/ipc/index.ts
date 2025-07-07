import { ipcMain } from 'electron';
import { createPluginView } from './window';
import { setWindowSize } from './window';

export const registerPluginIpc = () => {
  ipcMain.handle('plugin:create-view', createPluginView);
  ipcMain.handle('window:set-size', (_, width, height) => {
    setWindowSize(width as number, height as number);
  });
};
