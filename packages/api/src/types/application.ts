export interface IApplication {
  /** 应用程序唯一标识符 */
  id: string;
  /** 应用程序名称 */
  name: string;
  /** 应用程序描述 */
  description?: string;
  /** 应用程序可执行文件路径 */
  path: string;
  /** 应用程序图标路径 */
  iconPath?: string;
  /** 应用程序类型 */
  type: 'application' | 'shortcut' | 'script';
  /** 平台类型 */
  platform: 'win32' | 'darwin' | 'linux';
  /** 最后修改时间 */
  lastModified: number;
}

export interface IApplicationSearchConfig {
  /** 扫描目录列表 */
  scanDirectories: string[];
  /** 文件扩展名列表 */
  fileExtensions: string[];
  /** 是否包含 Windows Store 应用 */
  includeWindowsStoreApps?: boolean;
  /** 扫描深度 */
  maxDepth?: number;
  /** 是否启用文件系统监听 */
  enableWatcher?: boolean;
}

export interface IApplicationSearchResult {
  applications: IApplication[];
  totalCount: number;
  lastScanTime: number;
}

export interface IApplicationScanParams {
  /** 是否强制重新扫描 */
  forceRescan?: boolean;
  /** 是否异步扫描 */
  async?: boolean;
}

export interface IApplicationSearchParams {
  /** 搜索查询字符串 */
  query: string;
  /** 最大返回结果数 */
  limit?: number;
  /** 是否模糊搜索 */
  fuzzy?: boolean;
}

export interface IApplicationConfigUpdateParams {
  config: Partial<IApplicationSearchConfig>;
}

export interface IApplicationLaunchParams {
  /** 应用程序ID */
  applicationId: string;
  /** 启动参数 */
  args?: string[];
  /** 工作目录 */
  cwd?: string;
}

export interface IApplicationOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
} 