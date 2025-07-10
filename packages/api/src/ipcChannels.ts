export const IpcChannels = {
  // 日志相关事件
  LOG: 'log',

  // 窗口管理相关事件
  SET_WINDOW_SIZE: 'set-window-size',
  SHOW_WINDOW: 'show-window',
  HIDE_WINDOW: 'hide-window',
  TOGGLE_WINDOW: 'toggle-window',
  SET_GLOBAL_SHORTCUT: 'set-global-shortcut',
  GET_GLOBAL_SHORTCUT: 'get-global-shortcut',

  // 插件管理相关事件
  CREATE_PLUGIN_VIEW: 'create-plugin-view',
  CLOSE_PLUGIN_VIEW: 'close-plugin-view',
  PLUGIN_VIEW_CLOSED: 'plugin-view-closed',

  // 输入框相关事件
  SEARCH_INPUT_CHANGE: 'search-input-change',
  SEARCH_INPUT_ENTER: 'search-input-enter',

  // Webview 管理相关事件
  WEBVIEW_CREATE: 'webview-create',
  WEBVIEW_DESTROY: 'webview-destroy',
  WEBVIEW_UPDATE_URL: 'webview-update-url',
  WEBVIEW_RELOAD: 'webview-reload',
  WEBVIEW_TOGGLE_DEV_TOOLS: 'webview-toggle-dev-tools',
  WEBVIEW_SET_BOUNDS: 'webview-set-bounds',
  WEBVIEW_SET_VISIBLE: 'webview-set-visible',
  WEBVIEW_EXECUTE_JAVASCRIPT: 'webview-execute-javascript',
} as const;
