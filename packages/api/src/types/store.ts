// ============================================================================
// Store 存储服务相关类型定义
// ============================================================================

/**
 * 存储操作结果
 */
export interface IStoreOperationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * 设置存储值的参数
 */
export interface IStoreSetParams {
  /** 存储键名 */
  key: string;
  /** 存储值，支持JSON序列化的任意类型 */
  value: unknown;
  /** 是否立即同步到磁盘，默认true */
  sync?: boolean;
}

/**
 * 获取存储值的参数
 */
export interface IStoreGetParams {
  /** 存储键名 */
  key: string;
  /** 默认值，当键不存在时返回 */
  defaultValue?: unknown;
}

/**
 * 删除存储键的参数
 */
export interface IStoreDeleteParams {
  /** 要删除的存储键名 */
  key: string;
  /** 是否立即同步到磁盘，默认true */
  sync?: boolean;
}

/**
 * 检查键是否存在的参数
 */
export interface IStoreHasParams {
  /** 要检查的存储键名 */
  key: string;
}

/**
 * 获取所有键的参数（可选的过滤条件）
 */
export interface IStoreGetKeysParams {
  /** 键名前缀过滤器，只返回以此前缀开头的键 */
  prefix?: string;
}

/**
 * 清空存储的参数
 */
export interface IStoreClearParams {
  /** 是否保留某些键的模式，支持glob模式 */
  except?: string[];
  /** 是否立即同步到磁盘，默认true */
  sync?: boolean;
}

/**
 * 批量设置存储值的参数
 */
export interface IStoreSetManyParams {
  /** 键值对映射 */
  entries: Record<string, unknown>;
  /** 是否立即同步到磁盘，默认true */
  sync?: boolean;
}

/**
 * 批量获取存储值的参数
 */
export interface IStoreGetManyParams {
  /** 要获取的键名列表 */
  keys: string[];
  /** 默认值映射，当某个键不存在时使用对应的默认值 */
  defaultValues?: Record<string, unknown>;
}

/**
 * 获取存储大小的结果
 */
export interface IStoreSize {
  /** 键的数量 */
  count: number;
  /** 估算的字节大小 */
  bytes: number;
}

/**
 * 存储统计信息
 */
export interface IStoreStats {
  /** 存储大小信息 */
  size: IStoreSize;
  /** 存储文件路径 */
  filePath?: string;
  /** 最后同步时间 */
  lastSyncTime?: number;
} 