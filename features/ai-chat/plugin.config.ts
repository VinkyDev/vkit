import type { IPlugin, IPluginManifest, ISearchResultItem } from '@vkit/api';
import { PluginType } from '@vkit/api';

class AiChatPlugin implements IPlugin {
  readonly manifest: IPluginManifest = {
    id: 'ai-chat',
    name: 'AI 聊天',
    icon: 'https://api.iconify.design/fluent-color:chat-32.svg',
    version: '1.0.0',
    description: 'AI 聊天',
    entry: 'index.html',
    type: PluginType.PLUGIN,
    allowSearch: true,
    searchInputPlaceholder: '搜索 AI 聊天内容...',
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        ...this.manifest,
        pluginId: 'ai-chat-main',
        searchTerms: [],
      },
    ]);
  }

  isSupported(): boolean {
    return true;
  }
}

export default new AiChatPlugin();
