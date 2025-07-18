import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { createMainWindow } from './mainWindow';
import {
  setupIpc,
  initializeStoreService,
  destroyStoreService,
  initializeClipboardService,
  destroyClipboardService,
  destroyChatService,
} from './ipc';
import { initGlobalShortcut, cleanupGlobalShortcut } from './ipc/globalShortcut';

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.vinky.vkit');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  setupIpc();
  await initializeStoreService();
  initializeClipboardService();

  createMainWindow();
  initGlobalShortcut();
});

app.on('will-quit', async () => {
  cleanupGlobalShortcut();
  destroyChatService();
  destroyClipboardService();
  await destroyStoreService();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
