import { IpcChannels } from '../ipcChannels';
import type {
  IWebviewCreateParams,
  IWebviewUpdateUrlParams,
  IWebviewToggleDevToolsParams,
  IWebviewSetBoundsParams,
  IWebviewSetVisibleParams,
  IWebviewExecuteJavaScriptParams,
  IWebviewDestroyParams,
  IWebviewReloadParams,
  IWebviewOperationResult,
} from '../types';

// ============================================================================
// Webview 管理 API
// ============================================================================

/**
 * 创建一个新的webview
 * @param params 创建参数
 * @returns 操作结果，包含webview ID
 *
 * @example
 * ```typescript
 * // 创建一个简单的webview
 * const result = await createWebview({
 *   url: 'http://localhost:3000',
 *   bounds: { x: 0, y: 60, width: 800, height: 600 }
 * });
 * console.log('Webview ID:', result.data?.id);
 *
 * // 创建一个带自定义配置的webview
 * const result = await createWebview({
 *   id: 'my-webview',
 *   url: 'https://example.com',
 *   bounds: { x: 0, y: 60, width: 800, height: 600 },
 *   options: {
 *     webSecurity: false,
 *     nodeIntegration: true
 *   },
 *   openDevTools: true,
 *   devToolsMode: 'detach'
 * });
 *
 * // 创建隐藏的webview
 * const result = await createWebview({
 *   url: 'http://localhost:8080',
 *   visible: false,
 *   options: { webSecurity: false }
 * });
 * ```
 */
export const createWebview = async (
  params: IWebviewCreateParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_CREATE,
    params
  )) as IWebviewOperationResult;
};

/**
 * 销毁指定的webview
 * @param params 销毁参数，不传则销毁默认webview
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 销毁默认webview
 * const result = await destroyWebview();
 * if (result.success) {
 *   console.log('默认webview已销毁');
 * }
 *
 * // 销毁指定ID的webview
 * const result = await destroyWebview({ id: 'my-webview' });
 * if (!result.success) {
 *   console.error('销毁失败:', result.error);
 * }
 * ```
 */
export const destroyWebview = async (
  params?: IWebviewDestroyParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_DESTROY,
    params
  )) as IWebviewOperationResult;
};

/**
 * 更新webview的URL
 * @param params 更新参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 更新默认webview的URL
 * const result = await updateWebviewUrl({ 
 *   url: 'http://localhost:9001' 
 * });
 *
 * // 更新指定webview的URL
 * const result = await updateWebviewUrl({ 
 *   id: 'my-webview', 
 *   url: 'https://example.com/new-page' 
 * });
 *
 * // 检查操作结果
 * if (result.success) {
 *   console.log('URL更新成功');
 * } else {
 *   console.error('URL更新失败:', result.error);
 * }
 * ```
 */
export const updateWebviewUrl = async (
  params: IWebviewUpdateUrlParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_UPDATE_URL,
    params
  )) as IWebviewOperationResult;
};

/**
 * 重载webview内容
 * @param params 重载参数，不传则重载默认webview
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 重载默认webview
 * const result = await reloadWebview();
 *
 * // 忽略缓存重载
 * const result = await reloadWebview({ ignoreCache: true });
 *
 * // 重载指定webview并忽略缓存
 * const result = await reloadWebview({ 
 *   id: 'my-webview', 
 *   ignoreCache: true 
 * });
 *
 * if (result.success) {
 *   console.log('Webview重载成功');
 * }
 * ```
 */
export const reloadWebview = async (
  params?: IWebviewReloadParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_RELOAD,
    params
  )) as IWebviewOperationResult;
};

/**
 * 切换webview开发者工具
 * @param params 切换参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 开启默认webview的开发者工具
 * const result = await toggleWebviewDevTools({ enabled: true });
 *
 * // 以分离模式开启开发者工具
 * const result = await toggleWebviewDevTools({
 *   enabled: true,
 *   mode: 'detach'
 * });
 *
 * // 关闭指定webview的开发者工具
 * const result = await toggleWebviewDevTools({
 *   id: 'my-webview',
 *   enabled: false
 * });
 *
 * // 以底部停靠模式开启开发者工具
 * const result = await toggleWebviewDevTools({
 *   enabled: true,
 *   mode: 'bottom'
 * });
 * ```
 */
export const toggleWebviewDevTools = async (
  params: IWebviewToggleDevToolsParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_TOGGLE_DEV_TOOLS,
    params
  )) as IWebviewOperationResult;
};

/**
 * 设置webview的位置和大小
 * @param params 设置参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 设置默认webview的位置和大小
 * const result = await setWebviewBounds({
 *   bounds: { x: 0, y: 60, width: 1000, height: 700 }
 * });
 *
 * // 设置指定webview的位置和大小
 * const result = await setWebviewBounds({
 *   id: 'my-webview',
 *   bounds: { x: 100, y: 100, width: 800, height: 600 }
 * });
 *
 * // 将webview移动到右上角
 * const result = await setWebviewBounds({
 *   bounds: { x: 400, y: 0, width: 400, height: 300 }
 * });
 * ```
 */
export const setWebviewBounds = async (
  params: IWebviewSetBoundsParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_SET_BOUNDS,
    params
  )) as IWebviewOperationResult;
};

/**
 * 设置webview的可见性
 * @param params 设置参数
 * @returns 操作结果
 *
 * @example
 * ```typescript
 * // 隐藏默认webview
 * const result = await setWebviewVisible({ visible: false });
 *
 * // 显示指定webview
 * const result = await setWebviewVisible({ 
 *   id: 'my-webview', 
 *   visible: true 
 * });
 *
 * // 切换webview可见性
 * let isVisible = true;
 * const toggleVisibility = async () => {
 *   isVisible = !isVisible;
 *   await setWebviewVisible({ visible: isVisible });
 * };
 * ```
 */
export const setWebviewVisible = async (
  params: IWebviewSetVisibleParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_SET_VISIBLE,
    params
  )) as IWebviewOperationResult;
};

/**
 * 在webview中执行JavaScript代码
 * @param params 执行参数
 * @returns 操作结果，包含执行结果
 *
 * @example
 * ```typescript
 * // 在默认webview中获取页面标题
 * const result = await executeWebviewJavaScript({
 *   code: 'document.title'
 * });
 * if (result.success) {
 *   console.log('页面标题:', result.data);
 * }
 *
 * // 在指定webview中执行代码
 * const result = await executeWebviewJavaScript({
 *   id: 'my-webview',
 *   code: 'console.log("Hello from webview")',
 *   userGesture: true
 * });
 *
 * // 获取页面元素并操作
 * const result = await executeWebviewJavaScript({
 *   code: `
 *     const button = document.getElementById('my-button');
 *     if (button) {
 *       button.click();
 *       return 'Button clicked';
 *     }
 *     return 'Button not found';
 *   `
 * });
 *
 * // 获取页面数据
 * const result = await executeWebviewJavaScript({
 *   code: `
 *     ({
 *       url: window.location.href,
 *       title: document.title,
 *       userAgent: navigator.userAgent
 *     })
 *   `
 * });
 * ```
 */
export const executeWebviewJavaScript = async (
  params: IWebviewExecuteJavaScriptParams
): Promise<IWebviewOperationResult> => {
  return (await window.electron.ipcRenderer.invoke(
    IpcChannels.WEBVIEW_EXECUTE_JAVASCRIPT,
    params
  )) as IWebviewOperationResult;
}; 