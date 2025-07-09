import { type IPluginManifest, PluginType } from '@vkit/api';

export const builtinPlugins: IPluginManifest[] = [
  {
    id: 'json-editor',
    name: 'JSON 编辑器',
    iconUrl: 'https://i.imgs.ovh/2025/07/08/5wNAq.png',
    version: '1.0.0',
    description: 'JSON 编辑器插件',
    entry: 'index.html',
    allowSearch: true,
    type: PluginType.BUILTIN,
    weight: 10,
    matchRules: [
      {
        pattern: '[\\{\\}]', // 包含花括号
        weight: 20,
        description: 'JSON格式检测'
      },
      {
        pattern: '\\[.*\\]', // 包含方括号（数组格式）
        weight: 15,
        description: 'JSON数组格式检测'
      },
      {
        pattern: '"[^"]*"\\s*:', // key-value格式
        weight: 18,
        description: 'JSON键值对格式检测'
      },
      {
        pattern: '(json|JSON)', // 包含json关键字
        weight: 12,
        description: 'JSON关键字匹配'
      }
    ]
  },
];
