import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IpcChannels } from '@vkit/api';

export const setupLogger = () => {
  ipcMain.handle(IpcChannels.LOG, (_: IpcMainInvokeEvent, ...args: unknown[]) => {
    console.log(...args);
  });
};
