import { setupWindow } from './window';
import { setupWebviewManager } from './webviewManager';
import { setupPluginView } from './pluginView';
import { setupLogger } from './logger';

export const setupIpc = () => {
  setupWindow();
  setupWebviewManager();
  setupPluginView();
  setupLogger();
};
