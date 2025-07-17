import { IpcChannels } from '../ipcChannels';
import type {
  IApplication,
  IApplicationSearchConfig,
  IApplicationSearchResult,
  IApplicationScanParams,
  IApplicationSearchParams,
  IApplicationConfigUpdateParams,
  IApplicationLaunchParams,
  IApplicationOperationResult,
} from '../types';

// ============================================================================
// Application 应用程序搜索服务 API
// ============================================================================

/**
 * 扫描应用程序
 * @param params 扫描参数，可选
 * @returns 操作结果，包含扫描到的应用程序列表
 *
 * @example
 * ```typescript
 * // 普通扫描
 * const result = await scanApplications();
 * if (result.success) {
 *   console.log('扫描到的应用程序:', result.data?.applications);
 * }
 *
 * // 强制重新扫描
 * const forceResult = await scanApplications({ forceRescan: true });
 * ```
 */
export const scanApplications = async (
  params?: IApplicationScanParams
): Promise<IApplicationOperationResult<IApplicationSearchResult>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_SCAN,
    params
  )) as IApplicationOperationResult<IApplicationSearchResult>;
};

/**
 * 搜索应用程序
 * @param params 搜索参数
 * @returns 操作结果，包含搜索结果
 *
 * @example
 * ```typescript
 * // 模糊搜索
 * const result = await searchApplications({
 *   query: 'chrome',
 *   limit: 10,
 *   fuzzy: true
 * });
 * 
 * if (result.success) {
 *   result.data?.forEach(app => {
 *     console.log(`${app.name}: ${app.path}`);
 *   });
 * }
 *
 * // 精确搜索
 * const exactResult = await searchApplications({
 *   query: 'Safari',
 *   fuzzy: false
 * });
 * ```
 */
export const searchApplications = async (
  params: IApplicationSearchParams
): Promise<IApplicationOperationResult<IApplication[]>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_SEARCH,
    params
  )) as IApplicationOperationResult<IApplication[]>;
};

/**
 * 获取所有应用程序
 * @returns 操作结果，包含所有应用程序列表
 *
 * @example
 * ```typescript
 * const result = await getAllApplications();
 * if (result.success) {
 *   console.log('应用程序总数:', result.data?.totalCount);
 *   console.log('最后扫描时间:', new Date(result.data?.lastScanTime || 0));
 *   result.data?.applications.forEach(app => {
 *     console.log(`${app.name} - ${app.platform}`);
 *   });
 * }
 * ```
 */
export const getAllApplications = async (): Promise<
  IApplicationOperationResult<IApplicationSearchResult>
> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_GET_ALL
  )) as IApplicationOperationResult<IApplicationSearchResult>;
};

/**
 * 启动应用程序
 * @param params 启动参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 启动应用程序
 * const result = await launchApplication({
 *   applicationId: 'base64-encoded-app-id',
 *   args: ['--some-flag'],
 *   cwd: '/Users/username/Documents'
 * });
 * 
 * if (result.success) {
 *   console.log('应用程序已启动');
 * } else {
 *   console.error('启动失败:', result.error);
 * }
 * ```
 */
export const launchApplication = async (
  params: IApplicationLaunchParams
): Promise<IApplicationOperationResult<void>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_LAUNCH,
    params
  )) as IApplicationOperationResult<void>;
};

/**
 * 获取应用程序搜索配置
 * @returns 操作结果，包含当前配置
 *
 * @example
 * ```typescript
 * const result = await getApplicationConfig();
 * if (result.success) {
 *   console.log('扫描目录:', result.data?.scanDirectories);
 *   console.log('文件扩展名:', result.data?.fileExtensions);
 *   console.log('最大深度:', result.data?.maxDepth);
 * }
 * ```
 */
export const getApplicationConfig = async (): Promise<
  IApplicationOperationResult<IApplicationSearchConfig>
> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_GET_CONFIG
  )) as IApplicationOperationResult<IApplicationSearchConfig>;
};

/**
 * 更新应用程序搜索配置
 * @param params 配置更新参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 添加自定义扫描目录
 * const result = await updateApplicationConfig({
 *   config: {
 *     scanDirectories: [
 *       '/Applications',
 *       '/Users/username/Applications',
 *       '/opt/homebrew/Caskroom'
 *     ],
 *     maxDepth: 2
 *   }
 * });
 * 
 * if (result.success) {
 *   console.log('配置更新成功');
 *   // 重新扫描以应用新配置
 *   await refreshApplications();
 * }
 * ```
 */
export const updateApplicationConfig = async (
  params: IApplicationConfigUpdateParams
): Promise<IApplicationOperationResult<void>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_UPDATE_CONFIG,
    params
  )) as IApplicationOperationResult<void>;
};

/**
 * 刷新应用程序列表（强制重新扫描）
 * @returns 操作结果，包含更新后的应用程序列表
 *
 * @example
 * ```typescript
 * // 手动刷新应用程序列表
 * const result = await refreshApplications();
 * if (result.success) {
 *   console.log('刷新完成，找到', result.data?.totalCount, '个应用程序');
 * }
 * ```
 */
export const refreshApplications = async (): Promise<
  IApplicationOperationResult<IApplicationSearchResult>
> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.APPLICATION_REFRESH
  )) as IApplicationOperationResult<IApplicationSearchResult>;
};

/**
 * 监听应用程序扫描进度事件
 * @param callback 扫描进度变化时的回调函数
 * @returns 取消监听的函数
 *
 * @example
 * ```typescript
 * // 监听扫描进度
 * const unsubscribe = onApplicationScanProgress((progress) => {
 *   console.log(`扫描进度: ${progress.current}/${progress.total}`);
 *   updateProgressBar(progress.percentage);
 * });
 *
 * // 在组件卸载时取消监听
 * // unsubscribe();
 * ```
 */
export const onApplicationScanProgress = (
  callback: (progress: { current: number; total: number; percentage: number }) => void
) => {
  const listener = (_event: any, progress: { current: number; total: number; percentage: number }) => {
    callback(progress);
  };

  return window?.electron?.ipcRenderer?.on(IpcChannels.APPLICATION_SCAN_PROGRESS, listener);
};

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 根据应用程序ID获取应用程序信息
 * @param applicationId 应用程序ID
 * @returns 应用程序信息，如果未找到则返回null
 *
 * @example
 * ```typescript
 * const app = await getApplicationById('base64-encoded-app-id');
 * if (app) {
 *   console.log('应用程序:', app.name);
 *   console.log('路径:', app.path);
 * }
 * ```
 */
export const getApplicationById = async (applicationId: string): Promise<IApplication | null> => {
  const result = await getAllApplications();
  if (result.success && result.data) {
    return result.data.applications.find(app => app.id === applicationId) ?? null;
  }
  return null;
};

/**
 * 快速搜索应用程序（使用默认参数）
 * @param query 搜索关键词
 * @returns 搜索结果
 *
 * @example
 * ```typescript
 * const apps = await quickSearchApplications('text');
 * apps.forEach(app => {
 *   console.log(app.name);
 * });
 * ```
 */
export const quickSearchApplications = async (query: string): Promise<IApplication[]> => {
  const result = await searchApplications({ query, limit: 20, fuzzy: true });
  return result.success ? result.data ?? [] : [];
};
