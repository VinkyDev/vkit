import { IpcChannels } from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { applicationService } from '../service/applicationService';
import type {
  IApplicationScanParams,
  IApplicationSearchParams,
  IApplicationConfigUpdateParams,
  IApplicationLaunchParams,
} from '@vkit/api';

// 扫描应用程序
const scanApplications = async (_event: IpcMainInvokeEvent, params?: IApplicationScanParams) => {
  return await applicationService.scanApplications(params);
};

// 搜索应用程序
const searchApplications = (_event: IpcMainInvokeEvent, params: IApplicationSearchParams) => {
  return applicationService.searchApplications(params);
};

// 获取所有应用程序
const getAllApplications = () => {
  return applicationService.getAllApplications();
};

// 启动应用程序
const launchApplication = (_event: IpcMainInvokeEvent, params: IApplicationLaunchParams) => {
  return applicationService.launchApplication(params);
};

// 获取配置
const getConfig = () => {
  return applicationService.getConfig();
};

// 更新配置
const updateConfig = async (_event: IpcMainInvokeEvent, params: IApplicationConfigUpdateParams) => {
  return await applicationService.updateConfig(params);
};

// 强制刷新
const refreshApplications = async () => {
  return await applicationService.scanApplications({ forceRescan: true });
};

export const setupApplicationIpc = () => {
  ipcMain.handle(IpcChannels.APPLICATION_SCAN, scanApplications);
  ipcMain.handle(IpcChannels.APPLICATION_SEARCH, searchApplications);
  ipcMain.handle(IpcChannels.APPLICATION_GET_ALL, getAllApplications);
  ipcMain.handle(IpcChannels.APPLICATION_LAUNCH, launchApplication);
  ipcMain.handle(IpcChannels.APPLICATION_GET_CONFIG, getConfig);
  ipcMain.handle(IpcChannels.APPLICATION_UPDATE_CONFIG, updateConfig);
  ipcMain.handle(IpcChannels.APPLICATION_REFRESH, refreshApplications);
};

export const initializeApplicationService = async () => {
  return await applicationService.initialize();
};

export const destroyApplicationService = async () => {
  return await applicationService.destroy();
}; 