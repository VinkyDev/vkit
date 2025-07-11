import { setupWindow } from './window';
import { setupWebviewManager } from './webviewManager';
import { setupPluginView } from './pluginView';
import { setupPluginManager } from './pluginManager';
import { setupLogger } from './logger';
import { setupGlobalShortcut } from './globalShortcut';

export const setupIpc = () => {
  setupWindow();
  setupWebviewManager();
  setupPluginView();
  setupPluginManager();
  setupLogger();
  setupGlobalShortcut();
};
