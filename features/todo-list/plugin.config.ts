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
    name: 'Todo List',
    icon: 'https://api.iconify.design/material-symbols:checklist.svg?color=%23007acc',
    version: '1.0.0',
    description: '现代简洁的待办事项管理工具',
    entry: 'index.html',
    type: PluginType.BUILTIN,
    weight: 10,
  };

  getSearchResultItems(): Promise<ISearchResultItem[]> {
    return Promise.resolve([
      {
        id: 'todo-list-main',
        name: 'Todo List',
        icon: this.manifest.icon,
        description: '管理您的待办事项',
        searchTerms: ['task', '任务', '待办', '清单', 'list'],
        weight: 15,
        pluginId: this.manifest.id,
      },
    ]);
  }

  getInstantSearchResultItems(searchTerm: string): IInstantSearchResultItems {
    const items: IInstantSearchResultItem[] = [];
    const term = searchTerm.toLowerCase();
    const task = searchTerm.replace('add', '').trim();

    if (term.includes('add')) {
      items.push({
        id: 'todo-list-quick-add',
        name: `快速添加任务: ${task}`,
        icon: this.manifest.icon,
        description: '在Todo List中快速添加新任务',
        weight: 20,
        pluginId: this.manifest.id,
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
