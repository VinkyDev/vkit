import { is } from '@electron-toolkit/utils';
import { WINDOW_WIDTH } from '@vkit/constants';
import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
let mainWindow: BrowserWindow | null = null;
/**
 * 获取主窗口
 * @returns
 */
export function getMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }
  return null;
}

export function createMainWindow(): void {
  const win = (mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: 600,
    autoHideMenuBar: true,
    frame: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: true,
    },
  }));

  win.on('ready-to-show', () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev) {
    win.loadURL('http://localhost:9900');
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}
