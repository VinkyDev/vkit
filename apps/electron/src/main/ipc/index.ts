import { setupWindow } from './window';
import { setupWebviewManager } from './webviewManager';
import { setupPluginView } from './pluginView';
import { setupPluginManager } from './pluginManager';
import { setupLogger } from './logger';
import { setupGlobalShortcut } from './globalShortcut';
import { setupStoreIpc, initializeStoreService, destroyStoreService } from './store';
import { setupClipboardIpc, initializeClipboardService, destroyClipboardService } from './clipboard';
import { setupChatIpc, destroyChatService } from './chat';
// import { setupApplicationIpc, initializeApplicationService, destroyApplicationService } from './application';

export const setupIpc = () => {
  setupWindow();
  setupWebviewManager();
  setupPluginView();
  setupPluginManager();
  setupLogger();
  setupGlobalShortcut();
  setupStoreIpc();
  setupClipboardIpc();
  setupChatIpc();
  // setupApplicationIpc();
};

// 导出服务管理函数
export { initializeStoreService, destroyStoreService };
export { initializeClipboardService, destroyClipboardService };
export { destroyChatService };
// export { initializeApplicationService, destroyApplicationService };