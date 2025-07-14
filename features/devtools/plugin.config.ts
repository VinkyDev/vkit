import type { IPlugin, IPluginManifest, ISearchResultItem } from '@vkit/api';
import { PluginType } from '@vkit/api';

class DevToolsPlugin implements IPlugin {
  readonly manifest: IPluginManifest = {
    id: 'devtools',
    name: '开发者工具',
    icon: 'https://api.iconify.design/logos:web-dev-icon.svg',
    version: '1.0.0',
    description: '开发Vkit插件',
    entry: 'index.html',
    type: PluginType.PLUGIN,
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        ...this.manifest,
        pluginId: 'devtools-main',
        searchTerms: [],
      },
    ]);
  }

  isSupported(): boolean {
    return true;
  }
}

// 导出插件实例
export default new DevToolsPlugin();
