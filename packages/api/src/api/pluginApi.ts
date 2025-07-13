import { IpcChannels } from '../ipcChannels';
import type {
  IPluginManifest,
  ISearchInputChangeEvent,
  ISearchInputEnterEvent,
  IPluginInitData,
  IPlugin,
  ISearchResultItem,
  IInstantSearchResultItems,
} from '../types';

// ============================================================================
// 插件系统管理 API
// ============================================================================

/**
 * 获取所有插件列表
 * @returns Promise<IPlugin[]> 插件列表
 */
export const getAllPlugins = async (): Promise<IPlugin[]> => {
  return await window?.electron?.ipcRenderer?.invoke(IpcChannels.GET_ALL_PLUGINS) as IPlugin[];
};

/**
 * 获取所有搜索结果项
 * @returns Promise<ISearchResultItem[]> 搜索结果项列表
 */
export const getAllSearchItems = async (): Promise<ISearchResultItem[]> => {
  return await window?.electron?.ipcRenderer?.invoke(IpcChannels.GET_ALL_SEARCH_ITEMS) as ISearchResultItem[];
};

/**
 * 获取实时搜索结果
 * @param searchTerm 搜索词
 * @returns Promise<IInstantSearchResultItems> 实时搜索结果
 */
export const getInstantSearchResults = async (searchTerm: string): Promise<IInstantSearchResultItems> => {
  return await window?.electron?.ipcRenderer?.invoke(IpcChannels.GET_INSTANT_SEARCH_RESULTS, searchTerm) as IInstantSearchResultItems;
};

/**
 * 刷新插件列表（重新扫描）
 * @returns Promise<void>
 */
export const refreshPlugins = async (): Promise<void> => {
  await window?.electron?.ipcRenderer?.invoke(IpcChannels.REFRESH_PLUGINS);
};

// ============================================================================
// 插件管理 API
// ============================================================================

/**
 * 创建插件视图
 * @param plugin 插件清单信息
 * @param initData 初始化数据（可选）
 *
 * @example
 * ```typescript
 * // 创建一个简单的插件视图
 * createPluginView({
 *   id: 'my-plugin',
 *   name: '我的插件',
 *   iconUrl: 'https://example.com/icon.png',
 *   type: PluginType.BUILTIN,
 *   allowSearch: true
 * });
 *
 * // 创建带初始化数据的插件视图
 * createPluginView(pluginManifest, {
 *   initialValue: '{"name": "test"}',
 *   context: { mode: 'edit' }
 * });
 * ```
 */
export const createPluginView = (plugin: IPluginManifest, initData?: IPluginInitData): void => {
  window?.electron?.ipcRenderer?.invoke(IpcChannels.CREATE_PLUGIN_VIEW, plugin, initData);
};

/**
 * 关闭当前插件视图
 *
 * 注意：这将关闭当前活跃的插件视图以及所有相关的webview
 *
 * @example
 * ```typescript
 * // 关闭当前插件
 * await closePluginView();
 * ```
 */
export const closePluginView = (): void => {
  window?.electron?.ipcRenderer?.invoke(IpcChannels.CLOSE_PLUGIN_VIEW);
};

/**
 * 发送搜索输入变化事件到插件
 * @param event 搜索输入变化事件数据
 *
 * @example
 * ```typescript
 * // 当搜索框内容改变时发送事件
 * sendSearchInputChange({ value: 'new search text' });
 * ```
 */
export const sendSearchInputChange = (event: ISearchInputChangeEvent): void => {
  window?.electron?.ipcRenderer?.invoke(IpcChannels.SEARCH_INPUT_CHANGE, event);
};

/**
 * 发送搜索输入回车事件到插件
 * @param event 搜索输入回车事件数据
 *
 * @example
 * ```typescript
 * // 当用户在搜索框按回车时发送事件
 * sendSearchInputEnter({ value: 'search query' });
 * ```
 */
export const sendSearchInputEnter = (event: ISearchInputEnterEvent): void => {
  window?.electron?.ipcRenderer?.invoke(IpcChannels.SEARCH_INPUT_ENTER, event);
};

// ============================================================================
// 插件内监听器 API (用于插件内部使用)
// ============================================================================

/**
 * 在插件中监听搜索输入变化事件
 * @param callback 事件回调函数
 *
 * @example
 * ```typescript
 * // 在插件中监听搜索输入变化
 * onSearchInputChange((event) => {
 *   console.log('搜索内容变化:', event.value);
 *   // 更新插件界面...
 * });
 * ```
 */
export const onSearchInputChange = (callback: (event: ISearchInputChangeEvent) => void): void => {
  window?.electron?.ipcRenderer?.on(
    IpcChannels.SEARCH_INPUT_CHANGE,
    (_event, data: ISearchInputChangeEvent) => {
      callback(data);
    }
  );
};

/**
 * 在插件中监听搜索输入回车事件
 * @param callback 事件回调函数
 *
 * @example
 * ```typescript
 * // 在插件中监听回车事件
 * onSearchInputEnter((event) => {
 *   console.log('用户按下回车:', event.value);
 *   // 执行搜索操作...
 * });
 * ```
 */
export const onSearchInputEnter = (callback: (event: ISearchInputEnterEvent) => void): void => {
  window?.electron?.ipcRenderer?.on(
    IpcChannels.SEARCH_INPUT_ENTER,
    (_event, data: ISearchInputEnterEvent) => {
      callback(data);
    }
  );
};

/**
 * 监听插件视图关闭事件
 * @param callback 插件视图关闭时的回调函数
 *
 * @example
 * ```typescript
 * // 在主应用中监听插件视图关闭
 * onPluginViewClosed(() => {
 *   console.log('插件视图已关闭');
 *   // 重置应用状态...
 * });
 * ```
 */
export const onPluginViewClosed = (callback: () => void): void => {
  window?.electron?.ipcRenderer?.on(IpcChannels.PLUGIN_VIEW_CLOSED, () => {
    callback();
  });
};

/**
 * 移除插件视图关闭事件监听器
 * @param callback 要移除的回调函数
 *
 * @example
 * ```typescript
 * const handleClose = () => console.log('closed');
 * onPluginViewClosed(handleClose);
 *
 * // 稍后移除监听器
 * removePluginViewClosedListener(handleClose);
 * ```
 */
export const removePluginViewClosedListener = (): void => {
  window?.electron?.ipcRenderer?.removeAllListeners(IpcChannels.PLUGIN_VIEW_CLOSED);
};

// ============================================================================
// 插件初始化数据 API
// ============================================================================

/**
 * 从URL参数中获取插件初始化数据
 * @returns 插件上下文数据对象，如果没有则返回null
 *
 * @example
 * ```typescript
 * // 在插件中获取初始化数据
 * const context = getPluginInitData();
 * if (context?.mode) {
 *   // 根据模式设置编辑器
 * }
 * ```
 */
export const getPluginInitData = (): Record<string, unknown> | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const initDataParam = urlParams.get('initData');

    if (initDataParam) {
      const decodedData = decodeURIComponent(initDataParam);
      const parsedData = JSON.parse(decodedData) as IPluginInitData;
      return parsedData.context ?? null;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * 移除搜索输入事件监听器
 *
 * @example
 * ```typescript
 * // 移除所有搜索输入事件监听器
 * removeSearchInputListeners();
 * ```
 */
export const removeSearchInputListeners = (): void => {
  window?.electron?.ipcRenderer?.removeAllListeners(IpcChannels.SEARCH_INPUT_CHANGE);
  window?.electron?.ipcRenderer?.removeAllListeners(IpcChannels.SEARCH_INPUT_ENTER);
};

/**
 * 移除所有插件相关的事件监听器
 *
 * 注意：这会移除所有插件相关的监听器，包括插件视图关闭和搜索输入事件
 *
 * @example
 * ```typescript
 * // 在插件卸载时清理所有监听器
 * removeAllPluginListeners();
 * ```
 */
export const removeAllPluginListeners = (): void => {
  removePluginViewClosedListener();
  removeSearchInputListeners();
};
