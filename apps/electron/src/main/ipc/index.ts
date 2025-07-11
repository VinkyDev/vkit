import { setupWindow } from './window';
import { setupWebviewManager } from './webviewManager';
import { setupPluginView } from './pluginView';
import { setupPluginManager } from './pluginManager';
import { setupLogger } from './logger';
import { setupGlobalShortcut } from './globalShortcut';
import { setupStoreIpc, initializeStoreService, destroyStoreService } from './store';

export const setupIpc = () => {
  setupWindow();
  setupWebviewManager();
  setupPluginView();
  setupPluginManager();
  setupLogger();
  setupGlobalShortcut();
  setupStoreIpc();
};

// 导出store服务管理函数
export { initializeStoreService, destroyStoreService };
