import type {
  IPlugin,
  IPluginManifest,
  ISearchResultItem,
  IInstantSearchResultItems,
  IInstantSearchResultItem,
} from '@vkit/api';
import { PluginType } from '@vkit/api';

class JsonEditorPlugin implements IPlugin {
  readonly manifest: IPluginManifest = {
    id: 'json-editor',
    name: 'JSON 编辑器',
    icon: 'https://i.imgs.ovh/2025/07/09/6slFe.png',
    version: '1.0.0',
    description: 'JSON 编辑器',
    entry: 'index.html',
    type: PluginType.BUILTIN,
    weight: 10,
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        id: 'json-editor',
        name: 'JSON 编辑器',
        icon: this.manifest.icon,
        searchTerms: [],
        weight: 15,
        pluginId: this.manifest.id,
      },
    ]);
  }

  getInstantSearchResultItems(searchTerm: string): IInstantSearchResultItems {
    const items: IInstantSearchResultItem[] = [];
    const term = searchTerm.toLowerCase();
    if (term.includes('{') || term.includes('[')) {
      items.push({
        id: 'json-editor-instant',
        name: `编辑 JSON: ${searchTerm.substring(0, 10)}...`,
        icon: this.manifest.icon,
        description: '在JSON编辑器中打开',
        weight: 20,
        pluginId: this.manifest.id,
        data: { mode: 'edit', content: searchTerm },
      });
    }

    return { items };
  }

  isSupported(): boolean {
    return true;
  }
}

export default new JsonEditorPlugin();
