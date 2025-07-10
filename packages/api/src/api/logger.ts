import { IpcChannels } from '../ipcChannels';

export const log = async (...args: unknown[]): Promise<void> => {
  await window?.electron?.ipcRenderer?.invoke(IpcChannels.LOG, ...args);
};
