import type {
  IPlugin,
  IPluginManifest,
  ISearchResultItem,
  IInstantSearchResultItems,
  IInstantSearchResultItem,
} from '@vkit/api';
import { PluginType } from '@vkit/api';

class TodoListPlugin implements IPlugin {
  readonly manifest: IPluginManifest = {
    id: 'todo-list',
    name: 'TodoList',
    icon: 'https://api.iconify.design/vscode-icons:file-type-light-todo.svg',
    version: '1.0.0',
    description: '现代简洁的待办事项管理工具',
    entry: 'index.html',
    type: PluginType.PLUGIN,
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        ...this.manifest,
        pluginId: 'todo-list-main',
        searchTerms: ['task', '任务', '待办', '清单', 'list'],
      },
    ]);
  }

  getInstantSearchResultItems(searchTerm: string): IInstantSearchResultItems {
    const items: IInstantSearchResultItem[] = [];
    const term = searchTerm.toLowerCase();
    const task = searchTerm.replace('add', '').trim();

    if (term.includes('add')) {
      items.push({
        ...this.manifest,
        id: 'todo-list-quick-add',
        name: `快速添加任务: ${task}`,
        pluginId: 'todo-list-instant',
        data: { mode: 'quick-add', task },
      });
    }

    return { items };
  }

  isSupported(): boolean {
    return true;
  }
}

export default new TodoListPlugin();
