import { setupWindow } from './window';
import { setupWebviewManager } from './webviewManager';
import { setupPluginView } from './pluginView';

export const setupIpc = () => {
  setupWindow();
  setupWebviewManager();
  setupPluginView();
};
