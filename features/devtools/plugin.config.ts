import type { IPlugin, IPluginManifest, ISearchResultItem } from '@vkit/api';
import { PluginType } from '@vkit/api';

class DevToolsPlugin implements IPlugin {
  readonly manifest: IPluginManifest = {
    id: 'devtools',
    name: '开发者工具',
    icon: 'https://i.imgs.ovh/2025/07/09/6sEBh.png',
    version: '1.0.0',
    description: 'DevTools插件',
    entry: 'index.html',
    type: PluginType.BUILTIN,
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        id: 'devtools',
        name: '开发者工具',
        icon: this.manifest.icon,
        description: '开发Vkit插件',
        searchTerms: [],
        pluginId: this.manifest.id,
      },
    ]);
  }

  isSupported(): boolean {
    return true;
  }
}

// 导出插件实例
export default new DevToolsPlugin();
