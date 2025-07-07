import { BrowserWindow } from 'electron';
let mainWin: BrowserWindow | null = null;

export function setMainWin(win: BrowserWindow | null) {
  mainWin = win;
}
export function getMainWin() {
  return mainWin;
}
