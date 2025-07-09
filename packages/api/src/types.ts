export const enum PluginType {
  BUILTIN,
  REMOTE,
}

export interface IPluginMatchRule {
  pattern: string; // 正则表达式字符串
  weight: number; // 匹配权重，越高优先级越高
  description?: string; // 规则描述
}

export interface IPluginManifest {
  id: string;
  name: string;
  icon: string;
  version?: string;
  description?: string;
  markdown?: string;
  entry?: string;
  type: PluginType;
  allowSearch?: boolean;
  matchRules?: IPluginMatchRule[]; // 特殊匹配规则
  weight?: number; // 基础权重，默认为1
}

export interface IWindowSetSizeParams {
  width: number;
  height: number;
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
