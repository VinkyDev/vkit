export enum PluginType {
  BUILTIN,
  REMOTE,
}

export interface IPluginManifest {
  id: string;
  name: string;
  iconUrl: string;
  version?: string;
  description?: string;
  docx?: string;
  entry?: string;
  type: PluginType;
}

export interface IWindowSetSizeParams {
  width: number;
  height: number;
}
