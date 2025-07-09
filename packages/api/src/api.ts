import { IpcChannels } from './ipcChannels';
import type { 
  IPluginManifest, 
  IWindowSetSizeParams, 
  ISearchInputChangeEvent, 
  ISearchInputEnterEvent,
  IPluginInitData 
} from './types';

export const setWindowSize = async (params: IWindowSetSizeParams) => {
  await window.electron.ipcRenderer.invoke(IpcChannels.SET_WINDOW_SIZE, params);
};

export const showWindow = async () => {
  await window.electron.ipcRenderer.invoke(IpcChannels.SHOW_WINDOW);
};

export const hideWindow = async () => {
  await window.electron.ipcRenderer.invoke(IpcChannels.HIDE_WINDOW);
};

export const createPluginView = (plugin: IPluginManifest, initData?: IPluginInitData) => {
  window.electron.ipcRenderer.invoke(IpcChannels.CREATE_PLUGIN_VIEW, plugin, initData);
};

export const closePluginView = () => {
  window.electron.ipcRenderer.invoke(IpcChannels.CLOSE_PLUGIN_VIEW);
};

export const sendSearchInputChange = (event: ISearchInputChangeEvent) => {
  window.electron.ipcRenderer.invoke(IpcChannels.SEARCH_INPUT_CHANGE, event);
};

export const sendSearchInputEnter = (event: ISearchInputEnterEvent) => {
  window.electron.ipcRenderer.invoke(IpcChannels.SEARCH_INPUT_ENTER, event);
};

// 插件中监听输入框事件的方法
export const onSearchInputChange = (callback: (event: ISearchInputChangeEvent) => void) => {
  window.electron.ipcRenderer.on(IpcChannels.SEARCH_INPUT_CHANGE, (_event, data: ISearchInputChangeEvent) => {
    callback(data);
  });
};

export const onSearchInputEnter = (callback: (event: ISearchInputEnterEvent) => void) => {
  window.electron.ipcRenderer.on(IpcChannels.SEARCH_INPUT_ENTER, (_event, data: ISearchInputEnterEvent) => {
    callback(data);
  });
};

// 插件中监听初始化数据的方法
export const onPluginInitData = (callback: (data: IPluginInitData) => void) => {
  window.electron.ipcRenderer.on(IpcChannels.PLUGIN_INIT_DATA, (_event, data: IPluginInitData) => {
    callback(data);
  });
};

// 移除监听器
export const removeSearchInputListeners = () => {
  window.electron.ipcRenderer.removeAllListeners(IpcChannels.SEARCH_INPUT_CHANGE);
  window.electron.ipcRenderer.removeAllListeners(IpcChannels.SEARCH_INPUT_ENTER);
};

export const removePluginInitDataListener = () => {
  window.electron.ipcRenderer.removeAllListeners(IpcChannels.PLUGIN_INIT_DATA);
};