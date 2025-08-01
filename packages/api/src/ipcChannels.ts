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

  // 插件系统管理事件
  GET_ALL_PLUGINS: 'get-all-plugins',
  GET_ALL_SEARCH_ITEMS: 'get-all-search-items',
  GET_INSTANT_SEARCH_RESULTS: 'get-instant-search-results',
  REFRESH_PLUGINS: 'refresh-plugins',

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

  // Store 存储服务相关事件
  STORE_SET: 'store-set',
  STORE_GET: 'store-get',
  STORE_DELETE: 'store-delete',
  STORE_HAS: 'store-has',
  STORE_CLEAR: 'store-clear',
  STORE_GET_KEYS: 'store-get-keys',
  STORE_SET_MANY: 'store-set-many',
  STORE_GET_MANY: 'store-get-many',
  STORE_GET_SIZE: 'store-get-size',
  STORE_GET_STATS: 'store-get-stats',
  STORE_SYNC: 'store-sync',

  // Clipboard 剪切板服务相关事件
  CLIPBOARD_GET_HISTORY: 'clipboard-get-history',
  CLIPBOARD_DELETE_HISTORY: 'clipboard-delete-history',
  CLIPBOARD_UPDATE_HISTORY: 'clipboard-update-history',
  CLIPBOARD_TOGGLE_FAVORITE: 'clipboard-toggle-favorite',
  CLIPBOARD_DELETE_ALL_HISTORY: 'clipboard-delete-all-history',
  CLIPBOARD_CHANGED: 'clipboard-changed',

  // Application 应用程序搜索服务相关事件
  APPLICATION_SCAN: 'application-scan',
  APPLICATION_SEARCH: 'application-search',
  APPLICATION_GET_ALL: 'application-get-all',
  APPLICATION_LAUNCH: 'application-launch',
  APPLICATION_GET_CONFIG: 'application-get-config',
  APPLICATION_UPDATE_CONFIG: 'application-update-config',
  APPLICATION_REFRESH: 'application-refresh',
  APPLICATION_SCAN_PROGRESS: 'application-scan-progress',

  // AI Chat 聊天服务相关事件
  CHAT_GET_MODELS: 'chat-get-models',
  CHAT_START: 'chat-start',
  CHAT_STREAM_DATA: 'chat-stream-data',
  CHAT_TOOL_CALLS_DETECTED: 'chat-tool-calls-detected',
  CHAT_TOOL_CALLED: 'chat-tool-called',
  CHAT_TOOL_ERROR: 'chat-tool-error',
  CHAT_COMPLETED: 'chat-completed',
  CHAT_ERROR: 'chat-error',
} as const;
