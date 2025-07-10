import { is } from '@electron-toolkit/utils';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@vkit/constants';
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

/**
 * 显示主窗口
 */
export function showMainWindow() {
  const win = getMainWindow();
  if (win) {
    win.show();
    win.focus();
  }
}

/**
 * 隐藏主窗口
 */
export function hideMainWindow() {
  const win = getMainWindow();
  if (win) {
    win.hide();
  }
}

/**
 * 切换主窗口显示状态
 */
export function toggleMainWindow() {
  const win = getMainWindow();
  if (win) {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  }
}

export function createMainWindow(): void {
  const win = (mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    autoHideMenuBar: true,
    frame: false,
    skipTaskbar: true,
    vibrancy: 'fullscreen-ui',
    backgroundMaterial: 'acrylic',
    transparent: true,
    visualEffectState: 'active',
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

  // 窗口失焦自动隐藏
  win.on('blur', () => {
    if (!is.dev) {
      win.hide();
    }
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
