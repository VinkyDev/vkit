import type { PluginType, ISearchResultItem, IInstantSearchResultItems } from './search';

// ============================================================================
// 插件接口定义
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
  /** 插件作者 */
  author?: string;
  /** 搜索输入框的placeholder */
  searchInputPlaceholder?: string;
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

/**
 * 插件初始化数据
 */
export interface IPluginInitData {
  initialValue?: string;
  context?: Record<string, unknown>;
} 