export const enum PluginType {
  BUILTIN,
  REMOTE,
}

export interface IPluginMatchRule {
  pattern: string; // 正则表达式字符串
  weight: number; // 匹配权重，越高优先级越高
  description?: string; // 规则描述
}

export interface IPluginManifest {
  id: string;
  name: string;
  iconUrl: string;
  version?: string;
  description?: string;
  markdown?: string;
  entry?: string;
  type: PluginType;
  allowSearch?: boolean;
  matchRules?: IPluginMatchRule[]; // 特殊匹配规则
  weight?: number; // 基础权重，默认为1
}

export interface IWindowSetSizeParams {
  width: number;
  height: number;
}

export interface ISearchInputChangeEvent {
  value: string;
}

export interface ISearchInputEnterEvent {
  value: string;
}

export interface IPluginInitData {
  initialValue?: string;
  context?: Record<string, any>;
}
