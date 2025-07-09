import { IpcChannels } from '../ipcChannels';
import type {
  IPluginManifest,
  ISearchInputChangeEvent,
  ISearchInputEnterEvent,
  IPluginInitData,
} from '../types';

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
  window.electron.ipcRenderer.invoke(IpcChannels.CREATE_PLUGIN_VIEW, plugin, initData);
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
  window.electron.ipcRenderer.invoke(IpcChannels.CLOSE_PLUGIN_VIEW);
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
  window.electron.ipcRenderer.invoke(IpcChannels.SEARCH_INPUT_CHANGE, event);
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
  window.electron.ipcRenderer.invoke(IpcChannels.SEARCH_INPUT_ENTER, event);
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
  window.electron.ipcRenderer.on(
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
  window.electron.ipcRenderer.on(
    IpcChannels.SEARCH_INPUT_ENTER,
    (_event, data: ISearchInputEnterEvent) => {
      callback(data);
    }
  );
};

// ============================================================================
// 插件初始化数据 API
// ============================================================================

/**
 * 从URL参数中获取插件初始化数据
 * @returns 初始化数据对象，如果没有则返回null
 *
 * @example
 * ```typescript
 * // 在插件中获取初始化数据
 * const initData = getPluginInitData();
 * if (initData?.initialValue) {
 *   // 设置初始值
 *   setJsonValue(initData.initialValue);
 * }
 * if (initData?.context) {
 *   // 应用上下文配置
 *   applyContext(initData.context);
 * }
 * ```
 */
export const getPluginInitData = (): IPluginInitData | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const initDataParam = urlParams.get('initData');

    if (initDataParam) {
      const decodedData = decodeURIComponent(initDataParam);
      return JSON.parse(decodedData) as IPluginInitData;
    }

    return null;
  } catch {
    return null;
  }
};

// ============================================================================
// 清理监听器 API
// ============================================================================

/**
 * 移除所有搜索输入相关的监听器
 *
 * 通常在插件卸载时调用以避免内存泄漏
 *
 * @example
 * ```typescript
 * // 插件卸载时清理监听器
 * useEffect(() => {
 *   return () => {
 *     removeSearchInputListeners();
 *   };
 * }, []);
 * ```
 */
export const removeSearchInputListeners = (): void => {
  window.electron.ipcRenderer.removeAllListeners(IpcChannels.SEARCH_INPUT_CHANGE);
  window.electron.ipcRenderer.removeAllListeners(IpcChannels.SEARCH_INPUT_ENTER);
};
