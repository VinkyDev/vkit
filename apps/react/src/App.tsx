import {
  closePluginView,
  type IPluginManifest,
  type ISearchResultItem,
  getAllPlugins,
  getAllSearchItems as getSearchItemsFromIPC,
  getInstantSearchResults as getInstantSearchFromIPC,
  type IPlugin,
  createPluginView,
  type IPluginInitData,
} from '@vkit/api';
import { usePluginViewClose } from '@vkit/hooks';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchBar, PluginGrid } from './components';
import { searchInItems, type SearchResult } from './utils/search';

export default function App() {
  const [selectedPlugin, setSelectedPlugin] = useState<IPluginManifest | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cachedSearchItems, setCachedSearchItems] = useState<ISearchResultItem[]>([]);
  const [plugins, setPlugins] = useState<IPlugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pluginList, allItems] = await Promise.all([getAllPlugins(), getSearchItemsFromIPC()]);
      setPlugins(pluginList);
      setCachedSearchItems(allItems);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    loadData();
  }, []);

  // 计算搜索结果
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!inputValue.trim()) {
      return cachedSearchItems.slice(0, 6).map(item => ({
        item,
        score: 0,
        matchType: 'name' as const,
      }));
    }
    return searchInItems(inputValue, cachedSearchItems);
  }, [inputValue, cachedSearchItems]);

  // 实时搜索结果（异步处理）
  const [instantResults, setInstantResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setInstantResults([]);
      return;
    }

    const getInstantResults = async () => {
      try {
        const results = await getInstantSearchFromIPC(inputValue);
        const instantSearchResults: SearchResult[] = results.items.map(item => ({
          item,
          score: item.weight ?? 0,
          matchType: 'name' as const,
        }));
        setInstantResults(instantSearchResults);
      } catch {
        setInstantResults([]);
      }
    };

    getInstantResults();
  }, [inputValue]);

  // 合并所有搜索结果
  const allSearchResults = useMemo(
    () => [...instantResults, ...searchResults],
    [instantResults, searchResults]
  );

  // 自动重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [allSearchResults.length]);

  // 处理项目选择
  const handleItemSelect = useCallback(
    (result: SearchResult) => {
      const plugin = plugins.find(p => result.item.pluginId.includes(p.manifest.id));
      if (!plugin) return;

      const initData: IPluginInitData = {
        context: {
          ...result.item.data,
        },
      };

      createPluginView(plugin.manifest, initData);
      setSelectedPlugin(plugin.manifest);
      setInputValue('');
    },
    [plugins]
  );

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedPlugin || allSearchResults.length === 0) return;

      const maxIndex = allSearchResults.length - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
          break;
        case 'Enter': {
          e.preventDefault();
          const selectedResult = allSearchResults[selectedIndex];
          if (selectedResult) {
            handleItemSelect(selectedResult);
          }
          break;
        }
      }
    },
    [selectedPlugin, allSearchResults, selectedIndex, handleItemSelect]
  );

  // 注册键盘事件和插件关闭监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  usePluginViewClose(() => setSelectedPlugin(null));

  return (
    <div className='w-full h-screen flex flex-col bg-white/75'>
      <SearchBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        selectedPlugin={selectedPlugin}
        onPluginClose={closePluginView}
      />

      {!selectedPlugin && (
        <div className='flex-1 overflow-y-auto scrollbar-hide'>
          {isLoading ? (
            <div className='flex items-center justify-center py-16'>
              <div className='text-gray-500'>Loading plugins...</div>
            </div>
          ) : (
            <PluginGrid
              searchResults={allSearchResults}
              onItemSelect={handleItemSelect}
              searchQuery={inputValue}
              selectedIndex={selectedIndex}
            />
          )}
        </div>
      )}
    </div>
  );
}
