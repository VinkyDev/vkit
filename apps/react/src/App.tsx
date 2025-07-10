import { createPluginView, closePluginView, type IPluginManifest } from '@vkit/api';
import { usePluginViewClose } from '@vkit/hooks';
import { builtinPlugins } from './constants';
import { useState, useEffect, useCallback } from 'react';
import { SearchBar, PluginGrid } from './components';
import { searchPlugins } from './utils/search';

export default function App() {
  const [selectedPlugin, setSelectedPlugin] = useState<IPluginManifest | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedPluginIndex, setSelectedPluginIndex] = useState(0);

  // 根据搜索词过滤插件
  const filteredPlugins = inputValue.trim()
    ? searchPlugins(inputValue, builtinPlugins).map(result => result.plugin)
    : builtinPlugins;

  // 当搜索内容变化时，自动选中第一个结果
  useEffect(() => {
    if (filteredPlugins.length > 0) {
      setSelectedPluginIndex(0);
    }
  }, [inputValue, filteredPlugins.length]);

  // 确保选中索引在有效范围内
  useEffect(() => {
    if (selectedPluginIndex >= filteredPlugins.length && filteredPlugins.length > 0) {
      setSelectedPluginIndex(filteredPlugins.length - 1);
    } else if (selectedPluginIndex < 0 && filteredPlugins.length > 0) {
      setSelectedPluginIndex(0);
    }
  }, [selectedPluginIndex, filteredPlugins.length]);

  const handlePluginSelect = useCallback((plugin: IPluginManifest, searchValue?: string) => {
    const initData = searchValue?.trim() ? { initialValue: searchValue } : undefined;
    createPluginView(plugin, initData);
    setSelectedPlugin(plugin);
    setInputValue('');
  }, []);

  // 键盘导航处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedPlugin) return;

      if (filteredPlugins.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedPluginIndex(prev => (prev + 1) % filteredPlugins.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedPluginIndex(
            prev => (prev - 1 + filteredPlugins.length) % filteredPlugins.length
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredPlugins[selectedPluginIndex]) {
            handlePluginSelect(filteredPlugins[selectedPluginIndex], inputValue);
          }
          break;
      }
    },
    [selectedPlugin, filteredPlugins, selectedPluginIndex, inputValue, handlePluginSelect]
  );

  // 注册全局键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 监听插件视图关闭事件
  usePluginViewClose(() => {
    setSelectedPlugin(null);
  });

  return (
    <div className='w-full h-screen flex flex-col bg-transparent'>
      <SearchBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        selectedPlugin={selectedPlugin}
        onPluginClose={closePluginView}
      />

      {!selectedPlugin && (
        <div className='flex-1 overflow-y-auto scrollbar-hide'>
          <PluginGrid
            plugins={filteredPlugins}
            onPluginSelect={handlePluginSelect}
            searchQuery={inputValue}
            selectedIndex={selectedPluginIndex}
          />
        </div>
      )}
    </div>
  );
}
