import {
  IpcChannels,
  IStoreSetParams,
  IStoreGetParams,
  IStoreDeleteParams,
  IStoreHasParams,
  IStoreGetKeysParams,
  IStoreClearParams,
  IStoreSetManyParams,
  IStoreGetManyParams,
  IStoreOperationResult,
  IStoreSize,
  IStoreStats,
} from '@vkit/api';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { storeService } from '../service/storeService';

/**
 * 设置存储值的IPC处理器
 */
const handleStoreSet = async (
  _event: IpcMainInvokeEvent,
  params: IStoreSetParams
): Promise<IStoreOperationResult> => {
  return await storeService.set(params);
};

/**
 * 获取存储值的IPC处理器
 */
const handleStoreGet = (
  _event: IpcMainInvokeEvent,
  params: IStoreGetParams
): IStoreOperationResult => {
  return storeService.get(params);
};

/**
 * 删除存储键的IPC处理器
 */
const handleStoreDelete = async (
  _event: IpcMainInvokeEvent,
  params: IStoreDeleteParams
): Promise<IStoreOperationResult> => {
  return await storeService.delete(params);
};

/**
 * 检查键是否存在的IPC处理器
 */
const handleStoreHas = (
  _event: IpcMainInvokeEvent,
  params: IStoreHasParams
): IStoreOperationResult<boolean> => {
  return storeService.has(params);
};

/**
 * 获取所有键的IPC处理器
 */
const handleStoreGetKeys = (
  _event: IpcMainInvokeEvent,
  params?: IStoreGetKeysParams
): IStoreOperationResult<string[]> => {
  return storeService.getKeys(params);
};

/**
 * 清空存储的IPC处理器
 */
const handleStoreClear = async (
  _event: IpcMainInvokeEvent,
  params?: IStoreClearParams
): Promise<IStoreOperationResult> => {
  return await storeService.clear(params);
};

/**
 * 批量设置存储值的IPC处理器
 */
const handleStoreSetMany = async (
  _event: IpcMainInvokeEvent,
  params: IStoreSetManyParams
): Promise<IStoreOperationResult> => {
  return await storeService.setMany(params);
};

/**
 * 批量获取存储值的IPC处理器
 */
const handleStoreGetMany = (
  _event: IpcMainInvokeEvent,
  params: IStoreGetManyParams
): IStoreOperationResult<Record<string, unknown>> => {
  return storeService.getMany(params);
};

/**
 * 获取存储大小信息的IPC处理器
 */
const handleStoreGetSize = (_event: IpcMainInvokeEvent): IStoreOperationResult<IStoreSize> => {
  return storeService.getSize();
};

/**
 * 获取存储统计信息的IPC处理器
 */
const handleStoreGetStats = (_event: IpcMainInvokeEvent): IStoreOperationResult<IStoreStats> => {
  return storeService.getStats();
};

/**
 * 手动同步存储到磁盘的IPC处理器
 */
const handleStoreSync = async (_event: IpcMainInvokeEvent): Promise<IStoreOperationResult> => {
  return await storeService.sync();
};

/**
 * 设置store相关的IPC处理器
 */
export const setupStoreIpc = () => {
  // 注册所有store相关的IPC处理器
  ipcMain.handle(IpcChannels.STORE_SET, handleStoreSet);
  ipcMain.handle(IpcChannels.STORE_GET, handleStoreGet);
  ipcMain.handle(IpcChannels.STORE_DELETE, handleStoreDelete);
  ipcMain.handle(IpcChannels.STORE_HAS, handleStoreHas);
  ipcMain.handle(IpcChannels.STORE_GET_KEYS, handleStoreGetKeys);
  ipcMain.handle(IpcChannels.STORE_CLEAR, handleStoreClear);
  ipcMain.handle(IpcChannels.STORE_SET_MANY, handleStoreSetMany);
  ipcMain.handle(IpcChannels.STORE_GET_MANY, handleStoreGetMany);
  ipcMain.handle(IpcChannels.STORE_GET_SIZE, handleStoreGetSize);
  ipcMain.handle(IpcChannels.STORE_GET_STATS, handleStoreGetStats);
  ipcMain.handle(IpcChannels.STORE_SYNC, handleStoreSync);
};

/**
 * 初始化store服务
 */
export const initializeStoreService = async (): Promise<void> => {
  await storeService.initialize();
};

/**
 * 销毁store服务
 */
export const destroyStoreService = async (): Promise<void> => {
  await storeService.destroy();
};
