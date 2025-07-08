import { IpcChannels } from './ipcChannels';
import type { IPluginManifest, IWindowSetSizeParams } from './types';

export const setWindowSize = async (params: IWindowSetSizeParams) => {
  await window.electron.ipcRenderer.invoke(IpcChannels.SET_WINDOW_SIZE, params);
};

export const showWindow = async () => {
  await window.electron.ipcRenderer.invoke(IpcChannels.SHOW_WINDOW);
};

export const hideWindow = async () => {
  await window.electron.ipcRenderer.invoke(IpcChannels.HIDE_WINDOW);
};

export const createPluginView = (plugin: IPluginManifest) => {
  window.electron.ipcRenderer.invoke(IpcChannels.CREATE_PLUGIN_VIEW, plugin);
};

export const closePluginView = () => {
  window.electron.ipcRenderer.invoke(IpcChannels.CLOSE_PLUGIN_VIEW);
};