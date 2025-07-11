import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
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
} from '@vkit/api';
import { parse } from '@vkit/utils';

/**
 * Store Service - 提供持久化存储服务
 */
export class StoreService {
  private static instance: StoreService | null = null;

  private store: Map<string, unknown> = new Map();
  private storePath: string;
  private lastSyncTime: number = 0;
  private autoSyncTimer: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;

  constructor() {
    // 获取用户数据目录
    const userDataPath = app.getPath('userData');
    this.storePath = path.join(userDataPath, 'store.json');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): StoreService {
    StoreService.instance ??= new StoreService();
    return StoreService.instance;
  }

  /**
   * 初始化存储服务
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadFromDisk();
      this.startAutoSync();
    } catch (error) {
      console.error('Failed to initialize store service:', error);
    }
  }

  /**
   * 销毁存储服务
   */
  public async destroy(): Promise<void> {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
    if (this.isDirty) {
      await this.syncToDisk();
    }
  }

  /**
   * 设置存储值
   */
  public async set(params: IStoreSetParams): Promise<IStoreOperationResult> {
    try {
      this.store.set(params.key, params.value);
      this.markDirty();

      if (params.sync !== false) {
        await this.syncToDisk();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 获取存储值
   */
  public get(params: IStoreGetParams): IStoreOperationResult {
    try {
      const value = this.store.get(params.key);
      const result = value !== undefined ? value : params.defaultValue;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 删除存储键
   */
  public async delete(params: IStoreDeleteParams): Promise<IStoreOperationResult> {
    try {
      const deleted = this.store.delete(params.key);

      if (deleted) {
        this.markDirty();
        if (params.sync !== false) {
          await this.syncToDisk();
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 检查键是否存在
   */
  public has(params: IStoreHasParams): IStoreOperationResult<boolean> {
    try {
      const exists = this.store.has(params.key);
      return {
        success: true,
        data: exists,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 获取所有键
   */
  public getKeys(params?: IStoreGetKeysParams): IStoreOperationResult<string[]> {
    try {
      let keys = Array.from(this.store.keys());

      if (params?.prefix) {
        keys = keys.filter(key => key.startsWith(params.prefix!));
      }

      return {
        success: true,
        data: keys,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 清空存储
   */
  public async clear(params?: IStoreClearParams): Promise<IStoreOperationResult> {
    try {
      if (params?.except && params.except.length > 0) {
        // 保留指定的键
        const keysToDelete = Array.from(this.store.keys()).filter(
          key => !params.except!.includes(key)
        );

        for (const key of keysToDelete) {
          this.store.delete(key);
        }
      } else {
        // 清空所有键
        this.store.clear();
      }

      this.markDirty();

      if (params?.sync !== false) {
        await this.syncToDisk();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 批量设置存储值
   */
  public async setMany(params: IStoreSetManyParams): Promise<IStoreOperationResult> {
    try {
      for (const [key, value] of Object.entries(params.entries)) {
        this.store.set(key, value);
      }

      this.markDirty();

      if (params.sync !== false) {
        await this.syncToDisk();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 批量获取存储值
   */
  public getMany(params: IStoreGetManyParams): IStoreOperationResult<Record<string, unknown>> {
    try {
      const result: Record<string, unknown> = {};

      for (const key of params.keys) {
        const value = this.store.get(key);
        if (value !== undefined) {
          result[key] = value;
        } else if (params.defaultValues && key in params.defaultValues) {
          result[key] = params.defaultValues[key];
        }
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 获取存储大小信息
   */
  public getSize(): IStoreOperationResult<IStoreSize> {
    try {
      const count = this.store.size;

      // 估算字节大小
      let bytes = 0;
      for (const [key, value] of this.store) {
        bytes += Buffer.byteLength(key, 'utf8');
        bytes += Buffer.byteLength(JSON.stringify(value), 'utf8');
      }

      return {
        success: true,
        data: { count, bytes },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 获取存储统计信息
   */
  public getStats(): IStoreOperationResult<IStoreStats> {
    try {
      const sizeResult = this.getSize();
      if (!sizeResult.success) {
        return {
          success: false,
          error: sizeResult.error,
        };
      }

      return {
        success: true,
        data: {
          size: sizeResult.data!,
          filePath: this.storePath,
          lastSyncTime: this.lastSyncTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 手动同步到磁盘
   */
  public async sync(): Promise<IStoreOperationResult> {
    try {
      await this.syncToDisk();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 从磁盘加载数据
   */
  private async loadFromDisk(): Promise<void> {
    try {
      const data = await fs.readFile(this.storePath, 'utf8');
      const parsed = parse(data, '{}');

      if (typeof parsed === 'object' && parsed !== null) {
        this.store.clear();
        for (const [key, value] of Object.entries(parsed)) {
          this.store.set(key, value);
        }
      }
    } catch (error) {
      // 文件不存在或格式错误，使用空存储
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('Failed to load store from disk:', error);
      }
    }
  }

  /**
   * 同步到磁盘
   */
  private async syncToDisk(): Promise<void> {
    try {
      // 确保目录存在
      await fs.mkdir(path.dirname(this.storePath), { recursive: true });

      // 转换Map到Object
      const data: Record<string, unknown> = {};
      for (const [key, value] of this.store) {
        data[key] = value;
      }

      // 写入文件
      await fs.writeFile(this.storePath, JSON.stringify(data, null, 2), 'utf8');

      this.lastSyncTime = Date.now();
      this.isDirty = false;
    } catch (error) {
      console.error('Failed to sync store to disk:', error);
      throw error;
    }
  }

  /**
   * 标记为需要同步
   */
  private markDirty(): void {
    this.isDirty = true;
  }

  /**
   * 启动自动同步
   */
  private startAutoSync(): void {
    // 每5秒检查一次是否需要同步
    this.autoSyncTimer = setInterval(async () => {
      if (this.isDirty) {
        try {
          await this.syncToDisk();
        } catch (error) {
          console.error('Auto sync failed:', error);
        }
      }
    }, 5000);
  }
}

// 导出单例实例
export const storeService = StoreService.getInstance();
