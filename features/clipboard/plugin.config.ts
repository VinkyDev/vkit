import type { IPlugin, IPluginManifest, ISearchResultItem } from '@vkit/api';
import { PluginType } from '@vkit/api';

class ClipboardPlugin implements IPlugin {
  readonly manifest: IPluginManifest = {
    id: 'clipboard',
    name: '剪切板',
    icon: 'https://api.iconify.design/fluent-color:clipboard-text-edit-32.svg',
    version: '1.0.0',
    description: '剪切板',
    entry: 'index.html',
    type: PluginType.PLUGIN,
    allowSearch: true,
    searchInputPlaceholder: '搜索剪切板内容...',
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        ...this.manifest,
        pluginId: 'clipboard-main',
        searchTerms: [],
      },
    ]);
  }

  isSupported(): boolean {
    return true;
  }
}

export default new ClipboardPlugin();
