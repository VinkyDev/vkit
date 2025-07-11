import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { is } from '@electron-toolkit/utils';
import path from 'path';
import fs from 'fs';
import {
  IpcChannels,
  type IPlugin,
  type ISearchResultItem,
  type IInstantSearchResultItems,
  IInstantSearchResultItem,
} from '@vkit/api';

// 插件管理器类
class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private featuresPath: string;

  constructor() {
    if (is.dev) {
      this.featuresPath = path.resolve(__dirname, '../../../../features');
    } else {
      this.featuresPath = path.resolve(__dirname, '../features');
    }
  }

  /**
   * 扫描并加载所有插件
   */
  loadPlugins(): void {
    this.plugins.clear();

    try {
      if (!fs.existsSync(this.featuresPath)) {
        console.warn(`Features directory not found: ${this.featuresPath}`);
        return;
      }

      const featureDirs = fs
        .readdirSync(this.featuresPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const dirName of featureDirs) {
        try {
          const plugin = this.loadPlugin(dirName);
          if (plugin) {
            this.plugins.set(plugin.manifest.id, plugin);
          }
        } catch (error) {
          console.error(`Failed to load plugin ${dirName}:`, error);
        }
      }

      console.log(`Loaded ${this.plugins.size} plugins:`, Array.from(this.plugins.keys()));
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }

  /**
   * 加载单个插件
   */
  private loadPlugin(dirName: string): IPlugin | null {
    const pluginDir = path.join(this.featuresPath, dirName);
    
    const configPath = is.dev 
      ? path.join(pluginDir, 'dist', 'plugin.config.cjs')
      : path.join(pluginDir, 'plugin.config.cjs');

    if (!fs.existsSync(configPath)) {
      console.warn(`Plugin config not found: ${configPath}`);
      return null;
    }

    try {
      delete require.cache[configPath];
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pluginModule = require(configPath) as { default?: IPlugin };
      const plugin = pluginModule.default ?? (pluginModule as IPlugin);

      if (!plugin || typeof plugin !== 'object') {
        console.error(`Invalid plugin export in ${configPath}`);
        return null;
      }

      if (!plugin.manifest || typeof plugin.getSearchResultItems !== 'function') {
        console.error(`Plugin ${dirName} missing required interface`);
        return null;
      }

      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin config ${configPath}:`, error);
      return null;
    }
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 根据ID获取插件
   */
  getPlugin(id: string): IPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * 获取所有搜索结果项
   */
  async getAllSearchItems(): Promise<ISearchResultItem[]> {
    const allItems: ISearchResultItem[] = [];

    for (const plugin of this.plugins.values()) {
      if (!plugin.isSupported() || plugin.manifest.allowSearch === false) {
        continue;
      }

      try {
        const items = await plugin.getSearchResultItems();
        allItems.push(...items);
      } catch (error) {
        console.error(`Failed to get search items from plugin ${plugin.manifest.id}:`, error);
      }
    }

    return allItems;
  }

  /**
   * 获取实时搜索结果
   */
  getInstantSearchResults(searchTerm: string): IInstantSearchResultItems {
    const allItems: IInstantSearchResultItem[] = [];

    for (const plugin of this.plugins.values()) {
      if (!plugin.isSupported() || plugin.manifest.allowSearch === false) {
        continue;
      }

      try {
        if (plugin.getInstantSearchResultItems) {
          const results = plugin.getInstantSearchResultItems(searchTerm);
          allItems.push(...results.items);
        }
      } catch (error) {
        console.error(
          `Failed to get instant search results from plugin ${plugin.manifest.id}:`,
          error
        );
      }
    }

    return {
      items: allItems,
      hasMore: false,
    };
  }
}

// 全局插件管理器实例
const pluginManager = new PluginManager();

// IPC处理器函数
const handleGetAllPlugins = (_event: IpcMainInvokeEvent): IPlugin[] => {
  return pluginManager.getAllPlugins();
};

const handleGetAllSearchItems = async (
  _event: IpcMainInvokeEvent
): Promise<ISearchResultItem[]> => {
  return await pluginManager.getAllSearchItems();
};

const handleGetInstantSearchResults = (
  _event: IpcMainInvokeEvent,
  searchTerm: string
): IInstantSearchResultItems => {
  return pluginManager.getInstantSearchResults(searchTerm);
};

const handleRefreshPlugins = (_event: IpcMainInvokeEvent): void => {
  pluginManager.loadPlugins();
};

/**
 * 设置插件管理器IPC处理器
 */
export const setupPluginManager = () => {
  ipcMain.handle(IpcChannels.GET_ALL_PLUGINS, handleGetAllPlugins);
  ipcMain.handle(IpcChannels.GET_ALL_SEARCH_ITEMS, handleGetAllSearchItems);
  ipcMain.handle(IpcChannels.GET_INSTANT_SEARCH_RESULTS, handleGetInstantSearchResults);
  ipcMain.handle(IpcChannels.REFRESH_PLUGINS, handleRefreshPlugins);

  // 初始化时加载插件
  pluginManager.loadPlugins();
};

/**
 * 获取插件管理器实例（用于其他模块调用）
 */
export const getPluginManager = (): PluginManager => {
  return pluginManager;
};
