import { createPluginView, closePluginView, type IPluginManifest } from '@vkit/api';
import { builtinPlugins } from './constants';
import { useState } from 'react';
import { SearchBar, PluginGrid } from './components';

export default function App() {
  const [selectedPlugin, setSelectedPlugin] = useState<IPluginManifest | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handlePluginSelect = (plugin: IPluginManifest, searchValue?: string) => {
    const initData = searchValue?.trim() ? { initialValue: searchValue } : undefined;
    createPluginView(plugin, initData);
    setSelectedPlugin(plugin);
    setInputValue('');
  };

  const handlePluginClose = () => {
    closePluginView();
    setSelectedPlugin(null);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <div className='w-full bg-white/80 backdrop-blur-xl shadow-2xl text-gray-800 transition-all duration-300 ease-in-out'>
      <SearchBar
        inputValue={inputValue}
        onInputChange={handleInputChange}
        selectedPlugin={selectedPlugin}
        onPluginClose={handlePluginClose}
      />

      {!selectedPlugin && (
        <PluginGrid 
          plugins={builtinPlugins} 
          onPluginSelect={handlePluginSelect}
          searchQuery={inputValue}
        />
      )}
    </div>
  );
}
