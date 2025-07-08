import { type IPluginManifest, PluginType } from '@vkit/api';

export const builtinPlugins: IPluginManifest[] = [
  {
    id: 'json-editor',
    name: 'JSON 编辑器',
    iconUrl: 'https://i.imgs.ovh/2025/07/08/5wNAq.png',
    version: '1.0.0',
    description: 'JSON 编辑器插件',
    entry: 'index.html',
    type: PluginType.BUILTIN,
  },
];
