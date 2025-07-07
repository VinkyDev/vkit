import { WebContentsView } from 'electron';
import { getMainWin } from '../window';

// 创建插件视图
export async function createPluginView() {
  const mainWin = getMainWin();

  const pluginView = new WebContentsView({
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      webviewTag: true,
      spellcheck: false,
    },
  });

  await pluginView.webContents.loadURL('http://localhost:5200');

  mainWin?.contentView.addChildView(pluginView);

  pluginView.setBounds({ x: 0, y: 0, width: 400, height: 600 });
}

// 设置window窗口大小
export function setWindowSize(width: number, height: number) {
  const mainWin = getMainWin();
  mainWin?.setSize(width, height);
}