export const enum PluginType {
  BUILTIN,
  REMOTE,
}

// ============================================================================
// 搜索结果相关类型定义 
// ============================================================================

/**
 * 搜索结果项 - 插件提供的可搜索内容
 */
export interface ISearchResultItem {
  /** 结果项唯一标识符 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 图标URL或图标名称 */
  icon?: string;
  /** 描述信息 */
  description?: string;
  /** 搜索关键词（用于匹配搜索词） */
  searchTerms: string[];
  /** 权重，影响搜索排序，默认1 */
  weight?: number;
  /** 额外数据，创建视图时会传递给插件 */
  data?: Record<string, unknown>;
  /** 提供此结果项的插件ID */
  pluginId: string;
}

/**
 * 实时搜索结果项 - 用于实时搜索的轻量级结果
 */
export interface IInstantSearchResultItem {
  /** 结果项唯一标识符 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 图标URL或图标名称 */
  icon?: string;
  /** 描述信息 */
  description?: string;
  /** 权重，影响搜索排序，默认1 */
  weight?: number;
  /** 额外数据，创建视图时会传递给插件 */
  data?: Record<string, unknown>;
  /** 提供此结果项的插件ID */
  pluginId: string;
}

/**
 * 实时搜索结果集合
 */
export interface IInstantSearchResultItems {
  /** 结果项列表 */
  items: IInstantSearchResultItem[];
  /** 是否还有更多结果 */
  hasMore?: boolean;
  /** 下一页的token或offset */
  nextToken?: string;
}

// ============================================================================
// 插件接口定义 - 参考Ueli Extension
// ============================================================================

/**
 * 插件基础信息
 */
export interface IPluginManifest {
  /** 插件唯一标识符 */
  id: string;
  /** 插件名称 */
  name: string;
  /** 插件图标 */
  icon: string;
  /** 插件版本 */
  version?: string;
  /** 插件描述 */
  description?: string;
  /** 插件文档 */
  markdown?: string;
  /** 插件入口文件 */
  entry?: string;
  /** 插件类型 */
  type: PluginType;
  /** 是否允许搜索，默认true */
  allowSearch?: boolean;
  /** 基础权重，默认为1 */
  weight?: number;
}

/**
 * 插件接口 - 类似Ueli的Extension接口
 */
export interface IPlugin {
  /** 插件基础信息 */
  readonly manifest: IPluginManifest;

  /**
   * 获取搜索结果项列表
   * 此方法在应用启动时、设置更改时或手动触发重新扫描时调用
   * 由于此方法是异步的，可以进行较重的操作如API请求或文件扫描
   */
  getSearchResultItems(): Promise<ISearchResultItem[]>;

  /**
   * 获取实时搜索结果项
   * 此方法在每次用户输入变化时调用，应保持轻量级
   * @param searchTerm 当前搜索词
   */
  getInstantSearchResultItems?(searchTerm: string): IInstantSearchResultItems;

  /**
   * 判断此插件是否在当前系统上受支持
   * 不受支持的插件不会参与搜索
   */
  isSupported(): boolean;

  /**
   * 获取设置的默认值
   * @param key 设置键名
   */
  getSettingDefaultValue?(key: string): unknown;

  /**
   * 获取触发重新扫描的设置键列表
   * 当这些设置发生变化时，会重新调用getSearchResultItems()
   */
  getSettingKeysTriggeringRescan?(): string[];

  /**
   * 自定义调用方法（可选）
   * 可以通过IPC调用此方法实现自定义功能
   */
  invoke?(argument: unknown): Promise<unknown>;
}

// ============================================================================
// 现有类型定义保持不变
// ============================================================================

export interface IWindowSetSizeParams {
  width: number;
  height: number;
}

export interface IGlobalShortcutParams {
  shortcut: string;
}

export interface IGlobalShortcutResponse {
  shortcut: string;
  success: boolean;
  error?: string;
}

export interface ISearchInputChangeEvent {
  value: string;
}

export interface ISearchInputEnterEvent {
  value: string;
}

export interface IPluginInitData {
  initialValue?: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// Webview 相关类型定义
// ============================================================================

/**
 * Rectangle 类型定义（类似于 Electron.Rectangle）
 */
export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Webview 配置选项（基于 Electron.WebPreferences 的子集）
 */
export interface IWebviewOptions {
  /** 是否启用Node.js集成，默认false */
  nodeIntegration?: boolean;
  /** 是否启用上下文隔离，默认true */
  contextIsolation?: boolean;
  /** 是否启用web安全，默认true */
  webSecurity?: boolean;
  /** 是否允许运行不安全内容，默认false */
  allowRunningInsecureContent?: boolean;
  /** preload脚本路径 */
  preload?: string;
  /** 用户代理字符串 */
  userAgent?: string;
  /** 是否启用实验性功能，默认false */
  experimentalFeatures?: boolean;
}

/**
 * 开发者工具模式类型
 */
export type DevToolsMode = 'detach' | 'bottom' | 'right' | 'undocked';

/**
 * 创建webview的参数
 */
export interface IWebviewCreateParams {
  /** Webview唯一标识符，如果不提供会自动生成 */
  id?: string;
  /** 要加载的URL */
  url: string;
  /** Webview位置和大小 */
  bounds?: IRect;
  /** Webview配置选项 */
  options?: IWebviewOptions;
  /** 是否自动显示，默认true */
  visible?: boolean;
  /** 边框圆角，默认0 */
  borderRadius?: number;
  /** 是否自动打开开发者工具，默认false */
  openDevTools?: boolean;
  /** 开发者工具模式 */
  devToolsMode?: DevToolsMode;
  /** 背景颜色 */
  backgroundColor?: string;
}

/**
 * 更新webview URL的参数
 */
export interface IWebviewUpdateUrlParams {
  /** Webview ID，如果不提供则操作默认webview */
  id?: string;
  /** 新的URL */
  url: string;
}

/**
 * 切换开发者工具的参数
 */
export interface IWebviewToggleDevToolsParams {
  /** Webview ID，如果不提供则操作默认webview */
  id?: string;
  /** 是否启用开发者工具 */
  enabled: boolean;
  /** 开发者工具模式 */
  mode?: DevToolsMode;
}

/**
 * 设置webview位置和大小的参数
 */
export interface IWebviewSetBoundsParams {
  /** Webview ID，如果不提供则操作默认webview */
  id?: string;
  /** 新的位置和大小 */
  bounds: IRect;
}

/**
 * 设置webview可见性的参数
 */
export interface IWebviewSetVisibleParams {
  /** Webview ID，如果不提供则操作默认webview */
  id?: string;
  /** 是否可见 */
  visible: boolean;
}

/**
 * 执行JavaScript代码的参数
 */
export interface IWebviewExecuteJavaScriptParams {
  /** Webview ID，如果不提供则操作默认webview */
  id?: string;
  /** 要执行的JavaScript代码 */
  code: string;
  /** 是否在用户手势中执行，默认false */
  userGesture?: boolean;
}

/**
 * 销毁webview的参数
 */
export interface IWebviewDestroyParams {
  /** Webview ID，如果不提供则销毁默认webview */
  id?: string;
}

/**
 * 重载webview的参数
 */
export interface IWebviewReloadParams {
  /** Webview ID，如果不提供则重载默认webview */
  id?: string;
  /** 是否忽略缓存，默认false */
  ignoreCache?: boolean;
}

/**
 * Webview操作结果
 */
export interface IWebviewOperationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}
