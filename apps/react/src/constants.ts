import { type IPluginManifest, PluginType } from '@vkit/api';

export const builtinPlugins: IPluginManifest[] = [
  {
    id: 'json-editor',
    name: 'JSON 编辑器',
    icon: 'https://i.imgs.ovh/2025/07/09/6slFe.png',
    version: '1.0.0',
    description: 'JSON 编辑器插件',
    entry: 'index.html',
    type: PluginType.BUILTIN,
    weight: 10,
    matchRules: [
      {
        pattern: '[\\{\\}]', // 包含花括号
        weight: 20,
        description: 'JSON格式检测',
      },
      {
        pattern: '\\[.*\\]', // 包含方括号（数组格式）
        weight: 15,
        description: 'JSON数组格式检测',
      },
      {
        pattern: '"[^"]*"\\s*:', // key-value格式
        weight: 18,
        description: 'JSON键值对格式检测',
      },
      {
        pattern: '(json|JSON)', // 包含json关键字
        weight: 12,
        description: 'JSON关键字匹配',
      },
    ],
  },
  {
    id: 'devtools',
    name: '开发者工具',
    icon: 'https://i.imgs.ovh/2025/07/09/6sEBh.png',
    version: '1.0.0',
    description: 'DevTools插件',
    entry: 'index.html',
    type: PluginType.BUILTIN,
    weight: 10,
    matchRules: [
      {
        pattern: '(dev|开发|工具|devtools?|debug|调试)',
        weight: 15,
        description: '开发工具关键字匹配',
      },
      {
        pattern: '(localhost|127\\.0\\.0\\.1|本地|端口|port)',
        weight: 12,
        description: '本地开发服务器匹配',
      },
      {
        pattern: '(console|控制台|面板)',
        weight: 10,
        description: '控制台关键字匹配',
      },
    ],
  },
];
