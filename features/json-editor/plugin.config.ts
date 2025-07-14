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
    name: 'JSON',
    icon: 'https://api.iconify.design/logos:json-schema-icon.svg',
    version: '1.0.0',
    description: '简洁,现代的JSON编辑器',
    entry: 'index.html',
    type: PluginType.PLUGIN,
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        ...this.manifest,
        searchTerms: [],
        pluginId: 'json-editor-main',
      },
    ]);
  }

  getInstantSearchResultItems(searchTerm: string): IInstantSearchResultItems {
    const items: IInstantSearchResultItem[] = [];
    const term = searchTerm.toLowerCase();
    if (term.includes('{') || term.includes('[')) {
      items.push({
        ...this.manifest,
        name: `编辑 JSON: ${searchTerm.substring(0, 10)}...`,
        pluginId: 'json-editor-instant',
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
