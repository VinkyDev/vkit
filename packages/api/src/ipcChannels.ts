export const IpcChannels = {
  SET_WINDOW_SIZE: 'set-window-size',
  SHOW_WINDOW: 'show-window',
  HIDE_WINDOW: 'hide-window',

  CREATE_PLUGIN_VIEW: 'create-plugin-view',
  CLOSE_PLUGIN_VIEW: 'close-plugin-view',

  // 输入框相关事件
  SEARCH_INPUT_CHANGE: 'search-input-change',
  SEARCH_INPUT_ENTER: 'search-input-enter',
  
  // 插件初始化数据
  PLUGIN_INIT_DATA: 'plugin-init-data',
} as const;
