import { IpcChannels } from './ipcChannels';
import type { IWindowSetSizeParams } from './types';

export const setWindowSize = async (params: IWindowSetSizeParams) => {
  await window.electron.ipcRenderer.invoke(IpcChannels.SET_WINDOW_SIZE, params);
};
