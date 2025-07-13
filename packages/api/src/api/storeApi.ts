import { IpcChannels } from '../ipcChannels';
import { debounce } from 'lodash-es';
import type {
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
} from '../types';

// 防抖延迟
const debounceDelay = 1000;

// ============================================================================
// Store 存储服务 API
// ============================================================================

/**
 * 设置存储值
 * @param params 设置参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 设置字符串值
 * const result = setStoreValue({
 *   key: 'user.name',
 *   value: 'John Doe'
 * });
 *
 * // 设置对象值
 * const result = setStoreValue({
 *   key: 'user.preferences',
 *   value: { theme: 'dark', language: 'zh-CN' }
 * });
 *
 * // 设置值但不立即同步到磁盘
 * const result = setStoreValue({
 *   key: 'temp.data',
 *   value: { timestamp: Date.now() },
 *   sync: false
 * });
 * ```
 */
export const setStoreValue = debounce(
  async (params: IStoreSetParams): Promise<IStoreOperationResult> => {
    return (await window?.electron?.ipcRenderer?.invoke(
      IpcChannels.STORE_SET,
      params
    )) as IStoreOperationResult;
  },
  debounceDelay
);

/**
 * 获取存储值
 * @param params 获取参数
 * @returns 操作结果，包含存储的值
 *
 * @example
 * ```typescript
 * // 获取字符串值
 * const result = getStoreValue({ key: 'user.name' });
 * if (result.success) {
 *   console.log('用户名:', result.data);
 * }
 *
 * // 获取值并提供默认值
 * const result = getStoreValue({
 *   key: 'user.theme',
 *   defaultValue: 'light'
 * });
 * const theme = result.data || 'light';
 *
 * // 获取复杂对象
 * const result = getStoreValue({ key: 'user.preferences' });
 * if (result.success && result.data) {
 *   const preferences = result.data as { theme: string; language: string };
 *   console.log('主题:', preferences.theme);
 * }
 * ```
 */
export const getStoreValue = async <T = unknown>(
  params: IStoreGetParams
): Promise<IStoreOperationResult<T>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_GET,
    params
  )) as IStoreOperationResult<T>;
};

/**
 * 删除存储键
 * @param params 删除参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 删除指定键
 * const result = await deleteStoreKey({ key: 'temp.data' });
 * if (result.success) {
 *   console.log('键已删除');
 * }
 *
 * // 删除键但不立即同步
 * const result = await deleteStoreKey({
 *   key: 'cache.old',
 *   sync: false
 * });
 * ```
 */
export const deleteStoreKey = async (
  params: IStoreDeleteParams
): Promise<IStoreOperationResult> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_DELETE,
    params
  )) as IStoreOperationResult;
};

/**
 * 检查键是否存在
 * @param params 检查参数
 * @returns 操作结果，data为布尔值表示是否存在
 *
 * @example
 * ```typescript
 * // 检查键是否存在
 * const result = await hasStoreKey({ key: 'user.name' });
 * if (result.success) {
 *   if (result.data) {
 *     console.log('用户名已设置');
 *   } else {
 *     console.log('用户名未设置');
 *   }
 * }
 * ```
 */
export const hasStoreKey = async (
  params: IStoreHasParams
): Promise<IStoreOperationResult<boolean>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_HAS,
    params
  )) as IStoreOperationResult<boolean>;
};

/**
 * 获取所有存储键
 * @param params 获取参数
 * @returns 操作结果，data为键名数组
 *
 * @example
 * ```typescript
 * // 获取所有键
 * const result = await getStoreKeys({});
 * if (result.success) {
 *   console.log('所有键:', result.data);
 * }
 *
 * // 获取指定前缀的键
 * const result = await getStoreKeys({ prefix: 'user.' });
 * if (result.success) {
 *   console.log('用户相关键:', result.data);
 * }
 * ```
 */
export const getStoreKeys = async (
  params?: IStoreGetKeysParams
): Promise<IStoreOperationResult<string[]>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_GET_KEYS,
    params ?? {}
  )) as IStoreOperationResult<string[]>;
};

/**
 * 清空存储
 * @param params 清空参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 清空所有存储
 * const result = await clearStore({});
 * if (result.success) {
 *   console.log('存储已清空');
 * }
 *
 * // 清空存储但保留某些键
 * const result = await clearStore({
 *   except: ['app.version', 'user.settings']
 * });
 *
 * // 清空但不立即同步
 * const result = await clearStore({
 *   sync: false
 * });
 * ```
 */
export const clearStore = async (params?: IStoreClearParams): Promise<IStoreOperationResult> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_CLEAR,
    params ?? {}
  )) as IStoreOperationResult;
};

/**
 * 批量设置存储值
 * @param params 批量设置参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 批量设置多个值
 * const result = await setManyStoreValues({
 *   entries: {
 *     'user.name': 'John Doe',
 *     'user.email': 'john@example.com',
 *     'user.preferences': { theme: 'dark' }
 *   }
 * });
 *
 * // 批量设置但不立即同步
 * const result = await setManyStoreValues({
 *   entries: {
 *     'cache.item1': 'value1',
 *     'cache.item2': 'value2'
 *   },
 *   sync: false
 * });
 * ```
 */
export const setManyStoreValues = debounce(
  async (params: IStoreSetManyParams): Promise<IStoreOperationResult> => {
    return (await window?.electron?.ipcRenderer?.invoke(
      IpcChannels.STORE_SET_MANY,
      params
    )) as IStoreOperationResult;
  },
  debounceDelay
);

/**
 * 批量获取存储值
 * @param params 批量获取参数
 * @returns 操作结果，data为键值对映射
 *
 * @example
 * ```typescript
 * // 批量获取多个值
 * const result = await getManyStoreValues({
 *   keys: ['user.name', 'user.email', 'user.preferences']
 * });
 * if (result.success) {
 *   const values = result.data as Record<string, unknown>;
 *   console.log('用户名:', values['user.name']);
 *   console.log('邮箱:', values['user.email']);
 * }
 *
 * // 批量获取并提供默认值
 * const result = await getManyStoreValues({
 *   keys: ['user.theme', 'user.language'],
 *   defaultValues: {
 *     'user.theme': 'light',
 *     'user.language': 'en'
 *   }
 * });
 * ```
 */
export const getManyStoreValues = async (
  params: IStoreGetManyParams
): Promise<IStoreOperationResult<Record<string, unknown>>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_GET_MANY,
    params
  )) as IStoreOperationResult<Record<string, unknown>>;
};

/**
 * 获取存储大小信息
 * @returns 操作结果，data为大小信息
 *
 * @example
 * ```typescript
 * // 获取存储大小
 * const result = await getStoreSize();
 * if (result.success) {
 *   const size = result.data as IStoreSize;
 *   console.log(`存储了 ${size.count} 个键，大约 ${size.bytes} 字节`);
 * }
 * ```
 */
export const getStoreSize = async (): Promise<IStoreOperationResult<IStoreSize>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_GET_SIZE
  )) as IStoreOperationResult<IStoreSize>;
};

/**
 * 获取存储统计信息
 * @returns 操作结果，data为统计信息
 *
 * @example
 * ```typescript
 * // 获取存储统计
 * const result = await getStoreStats();
 * if (result.success) {
 *   const stats = result.data as IStoreStats;
 *   console.log('存储文件:', stats.filePath);
 *   console.log('最后同步:', new Date(stats.lastSyncTime!));
 *   console.log('大小:', stats.size);
 * }
 * ```
 */
export const getStoreStats = async (): Promise<IStoreOperationResult<IStoreStats>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_GET_STATS
  )) as IStoreOperationResult<IStoreStats>;
};

/**
 * 手动同步存储到磁盘
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 手动同步存储
 * const result = await syncStore();
 * if (result.success) {
 *   console.log('存储已同步到磁盘');
 * }
 * ```
 */
export const syncStore = debounce(async (): Promise<IStoreOperationResult> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.STORE_SYNC
  )) as IStoreOperationResult;
}, debounceDelay);
