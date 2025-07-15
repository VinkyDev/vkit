export const enum PluginType {
  /** 插件 */
  PLUGIN,
  /** 命令 */
  COMMAND,
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
  /** 类型 */
  type: PluginType;
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
  /** 类型 */
  type: PluginType;
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

/**
 * 搜索输入变化事件
 */
export interface ISearchInputChangeEvent {
  value: string;
}

/**
 * 搜索输入回车事件
 */
export interface ISearchInputEnterEvent {
  value: string;
} 