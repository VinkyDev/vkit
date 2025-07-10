import { app, BrowserWindow, globalShortcut } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { createMainWindow } from './mainWindow';
import { setupIpc } from './ipc';
import { closePluginView, hasActivePluginView } from './ipc/pluginView';

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.vinky.vkit');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  setupIpc();

  createMainWindow();

  // 注册ESC快捷键关闭插件视图
  globalShortcut.register('Escape', () => {
    if (hasActivePluginView()) {
      closePluginView();
    }
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('will-quit', () => {
  // 取消注册所有快捷键
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
